import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import AuthCheck from "../../components/AuthCheck";
import dummyData from "../../data/dummyData";
import FlashcardItem from "../../components/FlashcardItem";
import { theme } from "../../theme/theme";
import { commonStyles, iosButton, iosCard } from "../../utils/styles";
import { supabase } from "../../lib/supabase";
import Constants from "expo-constants";
import type { DocumentPickerResult } from "expo-document-picker";
import * as FileSystem from "expo-file-system";

type FileAsset = {
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
};

const Upload = () => {
  const [file, setFile] = useState<FileAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<any[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const progressAnim = new Animated.Value(0);

  useEffect(() => {
    if (generatedFlashcards.length > 0) {
      console.log("Updated flashcards state:", generatedFlashcards);
    }
  }, [generatedFlashcards]);
  useEffect(() => {
    if (showSuccess) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showSuccess]);

  const getApiUrl = () => {
    // 1. Try environment variable (set in app.config.js or app.json)
    const apiUrl = Constants.expoConfig?.extra?.apiUrl;
    if (apiUrl) return apiUrl;

    // 2. Try to auto-detect local IP from Expo debugger host (for mobile)
    // For classic Expo projects, use Constants.manifest; for EAS, use Constants.manifest2
    const debuggerHost =
      Constants.manifest?.debuggerHost || Constants.manifest2?.debuggerHost;
    if (Platform.OS !== "web" && debuggerHost) {
      const host = debuggerHost.split(":")[0];
      return `http://${host}:8000`;
    }

    // 3. Fallback to localhost for web
    return "http://localhost:8000";
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "text/plain"],
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const fileAsset = result.assets[0];
        console.log("File picked:", fileAsset);
        setFile({
          name: fileAsset.name,
          uri: fileAsset.uri,
          mimeType: fileAsset.mimeType,
          size: fileAsset.size,
        });
      } else if (result.canceled) {
        console.log("Document picker was cancelled by user");
      } else {
        console.error("Unexpected document picker result:", result);
        Alert.alert(
          "Error",
          "An unexpected error occurred while picking the document"
        );
      }
    } catch (err) {
      console.error("Error picking document:", err);
      Alert.alert("Error", "Failed to pick document. Please try again.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    progressAnim.setValue(0);

    try {
      // Create a unique filename
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split(".").pop();
      const fileName = `document_${timestamp}.${fileExtension}`;
      const filePath = `documents/${fileName}`;

      // Read the file content using expo-file-system
      console.log("Reading file content from:", file.uri);
      const fileInfo = await FileSystem.getInfoAsync(file.uri);
      if (!fileInfo.exists) {
        throw new Error("File does not exist at URI: " + file.uri);
      }
      const fileData = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // Convert base64 to Uint8Array
      const binaryString = atob(fileData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      console.log("Converted to Uint8Array, size:", bytes.length);

      // Upload to Supabase
      console.log("Uploading to Supabase...");
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, bytes, {
          contentType: file.mimeType || "application/pdf",
          upsert: false,
          cacheControl: "3600",
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw new Error(uploadError.message);
      }

      console.log("File uploaded successfully:", uploadData);

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(filePath);

      console.log("Public URL:", publicUrl);

      // Verify the uploaded file
      const verifyResponse = await fetch(publicUrl);
      if (!verifyResponse.ok) {
        throw new Error(
          `Failed to verify upload: ${verifyResponse.status} ${verifyResponse.statusText}`
        );
      }

      const verifyBlob = await verifyResponse.blob();
      console.log("Verified file size:", verifyBlob.size);

      if (verifyBlob.size === 0) {
        throw new Error("Uploaded file is empty");
      }

      // Animate progress
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }).start();

      // Update progress state
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5;
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 100);

      // Generate flashcards
      console.log("Generating flashcards...");
      const generateResponse = await fetch(`${getApiUrl()}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_url: publicUrl,
          num_flash_cards: 5,
          optional_instructions: "",
        }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        console.error("Generate error:", errorData);
        throw new Error(errorData.detail || "Failed to generate flashcards");
      }

      const data = await generateResponse.json();
      console.log("Received data:", data);
      if (data && data.flashcards) {
        setGeneratedFlashcards(data.flashcards);
        console.log("!!! Generated Flash Cards: ", generatedFlashcards);
        setCurrentFlashcardIndex(0);
      } else {
        throw new Error("Invalid response format from server");
      }

      clearInterval(interval);
      setIsUploading(false);
      setShowSuccess(true);
    } catch (error) {
      console.error("Error in handleUpload:", error);
      setIsUploading(false);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to upload and process file"
      );
    }
  };

  const handleSave = async () => {
    try {
      console.log("Starting save process...");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error getting user:", userError);
        throw userError;
      }
      if (!user) {
        throw new Error("User not found. Please log in again.");
      }
      console.log("User found:", user);

      // Call backend endpoint to save flashcards
      const response = await fetch(`${getApiUrl()}/save-flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flashcards: generatedFlashcards,
          user_id: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error saving flashcards:", errorData);
        throw new Error(errorData.detail || "Failed to save flashcards");
      }

      const result = await response.json();
      console.log("Flashcards saved successfully:", result);

      // Show success message
      setShowSuccess(true);
      setIsUploading(false);
      setIsProcessing(false);
      setFile(null);
      setGeneratedFlashcards([]);
    } catch (error) {
      console.error("Error in handleSave:", error);
      Alert.alert("Error", "Failed to save flashcards. Please try again.");
    }
  };

  const handleReject = () => {
    setFile(null);
    setGeneratedFlashcards([]);
  };

  const handleNextCard = () => {
    if (currentFlashcardIndex < generatedFlashcards.length - 1) {
      setCurrentFlashcardIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevCard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // if (showSuccess) {
  //   return (
  //     <View style={[commonStyles.container, styles.successContainer]}>
  //       <Animated.View
  //         style={[
  //           styles.successContent,
  //           {
  //             opacity: fadeAnim,
  //             transform: [{ scale: scaleAnim }],
  //           },
  //         ]}>
  //         <View style={styles.successIconContainer}>
  //           <MaterialIcons
  //             name="check-circle"
  //             size={64}
  //             color={theme.colors.primary}
  //           />
  //         </View>
  //         <Text style={styles.successTitle}>Upload Successful!</Text>
  //         <Text style={styles.successMessage}>
  //           Your flashcards have been generated and saved.
  //         </Text>
  //       </Animated.View>
  //     </View>
  //   );
  // }

  return (
    <AuthCheck>
      <ScrollView style={[commonStyles.container, styles.container]}>
        <View style={styles.content}>
          <Text style={[commonStyles.title, styles.title]}>
            Upload Document
          </Text>

          {!file && !generatedFlashcards.length ? (
            <TouchableOpacity
              style={[styles.uploadBox, iosCard]}
              onPress={handleFilePick}>
              <MaterialIcons
                name="cloud-upload"
                size={48}
                color={theme.colors.primary}
              />
              <Text style={styles.uploadText}>Upload a document</Text>
              <Text style={styles.uploadSubtext}>
                Upload a PDF, Word, or text document to generate flashcards
              </Text>
            </TouchableOpacity>
          ) : generatedFlashcards.length > 0 ? (
            <View style={styles.flashcardContainer}>
              <FlashcardItem
                card={{
                  id: generatedFlashcards[currentFlashcardIndex].id,
                  question: generatedFlashcards[currentFlashcardIndex].question,
                  answer: generatedFlashcards[currentFlashcardIndex].answer,
                  isFlipped,
                }}
                onFlip={handleFlip}
              />

              <View style={styles.navigation}>
                <TouchableOpacity
                  onPress={handlePrevCard}
                  disabled={currentFlashcardIndex === 0}
                  style={[styles.navButton, iosButton]}>
                  <MaterialIcons
                    name="chevron-left"
                    size={24}
                    color={
                      currentFlashcardIndex === 0
                        ? theme.colors.mutedForeground
                        : theme.colors.primary
                    }
                  />
                </TouchableOpacity>

                <View style={styles.counterContainer}>
                  <Text style={styles.counterText}>
                    {currentFlashcardIndex + 1} of {generatedFlashcards.length}{" "}
                    flashcards
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleNextCard}
                  disabled={
                    currentFlashcardIndex === generatedFlashcards.length - 1
                  }
                  style={[styles.navButton, iosButton]}>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={
                      currentFlashcardIndex === generatedFlashcards.length - 1
                        ? theme.colors.mutedForeground
                        : theme.colors.primary
                    }
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.rejectButton, iosButton]}
                  onPress={handleReject}>
                  <MaterialIcons
                    name="close"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, iosButton]}
                  onPress={handleSave}>
                  <MaterialIcons
                    name="check"
                    size={20}
                    color={theme.colors.background}
                  />
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[styles.fileContainer, iosCard]}>
              <View style={styles.fileHeader}>
                <View style={styles.fileInfo}>
                  <View style={styles.fileIcon}>
                    <MaterialIcons
                      name="description"
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View>
                    <Text style={styles.fileName}>{file?.name}</Text>
                    <Text style={styles.fileSize}>
                      {file?.size ? (file.size / 1024 / 1024).toFixed(2) : "0"}{" "}
                      MB
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setFile(null)}
                  style={[styles.removeButton, iosButton]}>
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={theme.colors.mutedForeground}
                  />
                </TouchableOpacity>
              </View>

              {isUploading ? (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                  />
                  <View style={styles.progressContainer}>
                    <Animated.View
                      style={[
                        styles.progressBar,
                        {
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0%", "100%"],
                          }),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.uploadingText}>
                    Uploading... {uploadProgress}%
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.uploadButton, iosButton]}
                  onPress={handleUpload}
                  disabled={isUploading}>
                  <MaterialIcons
                    name="cloud-upload"
                    size={20}
                    color={theme.colors.background}
                  />
                  <Text style={styles.buttonText}>
                    Upload and Generate Flashcards
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </AuthCheck>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.xl,
  },
  uploadBox: {
    padding: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  uploadText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "500" as const,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    color: theme.colors.foreground,
  },
  uploadSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  flashcardContainer: {
    gap: theme.spacing.lg,
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
  },
  navButton: {
    padding: theme.spacing.sm,
  },
  counterContainer: {
    alignItems: "center",
  },
  counterText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  rejectButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
  },
  rejectButtonText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.primary,
    fontWeight: "500" as const,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.background,
    fontWeight: "500" as const,
  },
  fileContainer: {
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  fileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileIcon: {
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
  },
  fileName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: "500" as const,
    color: theme.colors.foreground,
  },
  fileSize: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  removeButton: {
    padding: theme.spacing.sm,
  },
  uploadingContainer: {
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
  progressContainer: {
    height: 4,
    backgroundColor: theme.colors.secondary,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  uploadingText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    fontWeight: "500" as const,
    color: theme.colors.foreground,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.background,
    fontWeight: "500" as const,
  },
  successContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  successContent: {
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  successIconContainer: {
    marginBottom: theme.spacing.lg,
  },
  successTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: "600" as const,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
  },
  successMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    textAlign: "center",
  },
});

export default Upload;
