import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import AuthCheck from "../../components/AuthCheck";
import dummyData from "../../data/dummyData";
import FlashcardItem from "../../components/FlashcardItem";
import { theme } from "../../theme/theme";
import { commonStyles, iosButton, iosCard } from "../../utils/styles";

const Upload = () => {
  const [file, setFile] = useState<DocumentPicker.DocumentResult | null>(null);
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

      const timer = setTimeout(() => {
        router.push("/(tabs)/flashcards");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "text/plain"],
      });

      if (result.type === "success") {
        setFile(result);
      }
    } catch (err) {
      console.error("Error picking document:", err);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("files", {
        uri: file.uri,
        type: file.mimeType,
        name: file.name,
      } as any);

      // Upload file
      const uploadResponse = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setUploadProgress(i);
      }

      // Generate flashcards
      const generateResponse = await fetch(
        "http://localhost:8000/generate?num_flash_cards=5"
      );
      if (!generateResponse.ok) {
        throw new Error("Flashcard generation failed");
      }

      const flashcards = await generateResponse.json();
      setGeneratedFlashcards(flashcards);
      setIsUploading(false);
      setShowSuccess(true);
    } catch (error) {
      console.error("Error:", error);
      setIsUploading(false);
      // Handle error appropriately
    }
  };

  const handleSave = () => {
    // Here you would typically save the flashcards to your database
    setShowSuccess(true);
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

  if (showSuccess) {
    return (
      <View style={[commonStyles.container, styles.successContainer]}>
        <Animated.View
          style={[
            styles.successContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          <View style={styles.successIconContainer}>
            <MaterialIcons
              name="check-circle"
              size={64}
              color={theme.colors.primary}
            />
          </View>
          <Text style={styles.successTitle}>Upload Successful!</Text>
          <Text style={styles.successMessage}>
            Your flashcards have been generated and saved.
          </Text>
        </Animated.View>
      </View>
    );
  }

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
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
