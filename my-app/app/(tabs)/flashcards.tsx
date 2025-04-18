import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AuthCheck from "../../components/AuthCheck";
import FlashcardItem from "../../components/FlashcardItem";
import { theme } from "../../theme/theme";
import { commonStyles, iosButton, iosCard } from "../../utils/styles";
import { supabase } from "../../lib/supabase";

const Flashcards = () => {
  const [flashcardSets, setFlashcardSets] = useState<any[]>([]);
  const [currentSet, setCurrentSet] = useState<any>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFlashcards = async (setId: string) => {
    try {
      console.log("Fetching flashcards for set:", setId);
      const { data: flashcards, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("set_id", setId)
        .order("order_index");

      if (error) throw error;
      console.log("Fetched flashcards:", flashcards);
      setCurrentSet({
        ...flashcardSets.find((set) => set.id === setId),
        flashcards: flashcards || [],
      });
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
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

  if (isLoading) {
    return (
      <View style={[commonStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <AuthCheck>
      <ScrollView style={[commonStyles.container, styles.container]}>
        <View style={styles.content}>
          <Text style={[commonStyles.title, styles.title]}>My Flashcards</Text>

          {flashcardSets.length === 0 ? (
            <View style={[styles.emptyState, iosCard]}>
              <MaterialIcons
                name="collections-bookmark"
                size={48}
                color={theme.colors.primary}
              />
              <Text style={styles.emptyStateText}>No flashcard sets found</Text>
              <Text style={styles.emptyStateSubtext}>
                Upload a document to generate flashcards
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.setSelector}>
                {flashcardSets.map((set) => (
                  <TouchableOpacity
                    key={set.id}
                    style={[
                      styles.setButton,
                      currentSet?.id === set.id && styles.activeSetButton,
                      iosButton,
                    ]}
                    onPress={() => fetchFlashcards(set.id)}>
                    <Text
                      style={[
                        styles.setButtonText,
                        currentSet?.id === set.id && styles.activeSetButtonText,
                      ]}>
                      {set.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {currentSet?.flashcards && currentSet.flashcards.length > 0 ? (
                <View style={styles.flashcardContainer}>
                  <FlashcardItem
                    card={{
                      id: currentSet.flashcards[currentCardIndex].id,
                      question:
                        currentSet.flashcards[currentCardIndex].question,
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
              ) : (
                <View style={[styles.emptyState, iosCard]}>
                  <MaterialIcons
                    name="error-outline"
                    size={48}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.emptyStateText}>
                    No flashcards in this set
                  </Text>
                </View>
              )}
            </>
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
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "500",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    color: theme.colors.foreground,
  },
  emptyStateSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    textAlign: "center",
  },
  setSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  setButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  activeSetButton: {
    backgroundColor: theme.colors.primary,
  },
  setButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.foreground,
  },
  activeSetButtonText: {
    color: theme.colors.background,
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
});

export default Flashcards;
