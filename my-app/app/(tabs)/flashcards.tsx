import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AuthCheck from "../../components/AuthCheck";
import FlashcardItem from "../../components/FlashcardItem";
import { theme } from "../../theme/theme";
import { commonStyles, iosButton, iosCard } from "../../utils/styles";
import { supabase } from "../../lib/supabase";

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  created_at: string;
  user_id: string;
}

interface CurrentSet extends FlashcardSet {
  flashcards: Array<{
    id: string;
    question: string;
    answer: string;
    order_index: number;
  }>;
}

const Flashcards = () => {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [currentSet, setCurrentSet] = useState<CurrentSet | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchFlashcardSets();
  }, []);

  const fetchFlashcardSets = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching flashcard sets...");

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No authenticated user");

      // Fetch flashcard sets for the current user
      const { data: sets, error: setsError } = await supabase
        .from("flashcard_sets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (setsError) throw setsError;
      console.log("Fetched sets:", sets);
      setFlashcardSets(sets || []);

      // If there are sets, fetch the first set's flashcards
      if (sets && sets.length > 0) {
        await fetchFlashcards(sets[0].id);
      }
    } catch (error) {
      console.error("Error fetching flashcard sets:", error);
      Alert.alert("Error", "Failed to load flashcard sets");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFlashcards = async (setId: string) => {
    try {
      console.log("Fetching flashcards for set:", setId);

      // First, try to find the set in our current state
      const currentSetData = flashcardSets.find((set) => set.id === setId);
      if (!currentSetData) {
        console.log(
          "Set not found in current state, fetching from database..."
        );

        // If set not found in state, try to fetch it from the database
        const { data: setData, error: setError } = await supabase
          .from("flashcard_sets")
          .select("*")
          .eq("id", setId)
          .single();

        if (setError || !setData) {
          console.log("Set not found in database either");
          return;
        }

        // Update the current set with the fetched data
        const { data: flashcards, error } = await supabase
          .from("flashcards")
          .select("*")
          .eq("set_id", setId)
          .order("order_index");

        if (error) throw error;

        const updatedCurrentSet: CurrentSet = {
          ...setData,
          flashcards: flashcards || [],
        };

        setCurrentSet(updatedCurrentSet);
      } else {
        // If set found in state, proceed with fetching flashcards
        const { data: flashcards, error } = await supabase
          .from("flashcards")
          .select("*")
          .eq("set_id", setId)
          .order("order_index");

        if (error) throw error;

        const updatedCurrentSet: CurrentSet = {
          ...currentSetData,
          flashcards: flashcards || [],
        };

        setCurrentSet(updatedCurrentSet);
      }

      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      // Don't show error alert as this might be a normal case
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleNextCard = () => {
    if (
      currentSet?.flashcards &&
      currentCardIndex < currentSet.flashcards.length - 1
    ) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSetPress = (setId: string) => {
    fetchFlashcards(setId);
    // Scroll to top when a new set is selected
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleEditPress = () => {
    setEditedName(currentSet?.title || "");
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (!currentSet?.id || !editedName.trim()) {
        Alert.alert("Error", "Please enter a valid set name");
        return;
      }

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No authenticated user");

      // Update the set name in the database
      const { error: updateError } = await supabase
        .from("flashcard_sets")
        .update({
          title: editedName.trim(),
          last_modified: new Date().toISOString(),
        })
        .eq("id", currentSet.id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Update the current set
      setCurrentSet((prev: CurrentSet | null) =>
        prev ? { ...prev, title: editedName.trim() } : null
      );

      // Update the flashcard sets list
      setFlashcardSets((prev: FlashcardSet[]) =>
        prev.map((set) =>
          set.id === currentSet.id ? { ...set, title: editedName.trim() } : set
        )
      );

      setShowEditModal(false);
      Alert.alert("Success", "Set name updated successfully");
    } catch (error) {
      console.error("Error updating set name:", error);
      Alert.alert("Error", "Failed to update set name. Please try again.");
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await fetchFlashcardSets();
    } catch (error) {
      console.error("Error refreshing sets:", error);
      Alert.alert("Error", "Failed to refresh flashcard sets");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[commonStyles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading your flashcard sets...</Text>
      </View>
    );
  }

  return (
    <AuthCheck>
      <ScrollView
        ref={scrollViewRef}
        style={[commonStyles.container, styles.container]}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={[commonStyles.title, styles.title]}>
              Your Flashcard Sets
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={isRefreshing}>
              <MaterialIcons
                name="refresh"
                size={24}
                color={
                  isRefreshing
                    ? theme.colors.mutedForeground
                    : theme.colors.primary
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        {flashcardSets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="style"
              size={48}
              color={theme.colors.mutedForeground}
            />
            <Text style={styles.emptyText}>No flashcard sets yet</Text>
            <Text style={styles.emptySubtext}>
              Upload a document to create your first set
            </Text>
            <TouchableOpacity
              style={[styles.uploadButton, iosButton]}
              onPress={() => router.push("/(tabs)/upload")}>
              <MaterialIcons
                name="cloud-upload"
                size={24}
                color={theme.colors.background}
              />
              <Text style={styles.uploadButtonText}>Upload Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {currentSet?.flashcards && currentSet.flashcards.length > 0 && (
              <View style={styles.flashcardContainer}>
                <View style={styles.setHeaderContainer}>
                  <Text style={styles.currentSetTitle} numberOfLines={1}>
                    {currentSet.title}
                  </Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditPress}>
                    <MaterialIcons
                      name="edit"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                </View>

                <FlashcardItem
                  card={{
                    id: currentSet.flashcards[currentCardIndex].id,
                    question: currentSet.flashcards[currentCardIndex].question,
                    answer: currentSet.flashcards[currentCardIndex].answer,
                    isFlipped,
                  }}
                  onFlip={handleFlip}
                />

                <View style={styles.navigation}>
                  <TouchableOpacity
                    onPress={handlePrevCard}
                    disabled={currentCardIndex === 0}
                    style={[styles.navButton, iosButton]}>
                    <MaterialIcons
                      name="chevron-left"
                      size={24}
                      color={
                        currentCardIndex === 0
                          ? theme.colors.mutedForeground
                          : theme.colors.primary
                      }
                    />
                  </TouchableOpacity>

                  <View style={styles.counterContainer}>
                    <Text style={styles.counterText}>
                      {currentCardIndex + 1} of {currentSet.flashcards.length}{" "}
                      flashcards
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleNextCard}
                    disabled={
                      currentCardIndex === currentSet.flashcards.length - 1
                    }
                    style={[styles.navButton, iosButton]}>
                    <MaterialIcons
                      name="chevron-right"
                      size={24}
                      color={
                        currentCardIndex === currentSet.flashcards.length - 1
                          ? theme.colors.mutedForeground
                          : theme.colors.primary
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.setsContainer}>
              <View style={[styles.setCard, { borderBottomWidth: 0 }]}>
                <View style={styles.setHeader}>
                  <Text style={[styles.setTitle, { fontWeight: "600" }]}>
                    Set Name
                  </Text>
                  <Text style={[styles.setDate, { fontWeight: "600" }]}>
                    Created
                  </Text>
                </View>
              </View>
              {flashcardSets.map((set) => (
                <TouchableOpacity
                  key={set.id}
                  style={[
                    styles.setCard,
                    currentSet?.id === set.id && styles.activeSetCard,
                  ]}
                  onPress={() => handleSetPress(set.id)}>
                  <View style={styles.setHeader}>
                    <Text style={styles.setTitle} numberOfLines={1}>
                      {set.title}
                    </Text>
                    <Text style={styles.setDate}>
                      {formatDate(set.created_at)}
                    </Text>
                  </View>
                  <View style={styles.setFooter}>
                    <MaterialIcons
                      name="chevron-right"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Modal
          visible={showEditModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowEditModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Set Name</Text>
              <TextInput
                style={styles.nameInput}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter set name"
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowEditModal(false)}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveEdit}>
                  <Text style={[styles.modalButtonText, styles.saveButtonText]}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </AuthCheck>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.mutedForeground,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
  },
  uploadButtonText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.background,
    fontWeight: "500",
  },
  setsContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  setCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  setHeader: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  setTitle: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    fontWeight: "500",
    color: theme.colors.foreground,
  },
  setDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    minWidth: 100,
    textAlign: "right",
  },
  setDescription: {
    display: "none", // Hide description in tabular view
  },
  setFooter: {
    marginLeft: theme.spacing.md,
  },
  activeSetCard: {
    backgroundColor: theme.colors.primary + "10",
  },
  currentSetTitle: {
    flex: 1,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginRight: theme.spacing.md,
  },
  setsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  flashcardContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
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
  scrollContent: {
    flexGrow: 1,
  },
  setHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  editButton: {
    padding: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: theme.spacing.md,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.lg,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.md,
  },
  modalButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: theme.colors.muted,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  modalButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: "500",
    color: theme.colors.foreground,
  },
  saveButtonText: {
    color: theme.colors.background,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  refreshButton: {
    padding: theme.spacing.sm,
  },
});

export default Flashcards;
