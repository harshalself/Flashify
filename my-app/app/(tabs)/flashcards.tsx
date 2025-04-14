import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AuthCheck from "../../components/AuthCheck";
import dummyData from "../../data/dummyData";
import FlashcardSetCard from "../../components/FlashcardSetCard";
import FlashcardItem from "../../components/FlashcardItem";
import { theme } from "../../theme/theme";
import { commonStyles, iosButton } from "../../utils/styles";

const Flashcards = () => {
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const selectedSet = selectedSetId
    ? dummyData.flashcardSets.find((set) => set.id === selectedSetId)
    : null;

  const selectedCards = selectedSetId
    ? dummyData.flashcards[selectedSetId] || []
    : [];

  const handleSetClick = (setId: string) => {
    setSelectedSetId(setId);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleBackToSets = () => {
    setSelectedSetId(null);
  };

  const handleNextCard = () => {
    if (currentCardIndex < selectedCards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <AuthCheck>
      <ScrollView style={[commonStyles.container, styles.container]}>
        {selectedSetId ? (
          <View style={styles.content}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleBackToSets}
                style={[styles.backButton, iosButton]}>
                <MaterialIcons
                  name="arrow-back"
                  size={24}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
              <Text style={[commonStyles.title, styles.title]}>
                {selectedSet?.title}
              </Text>
            </View>

            {selectedCards.length > 0 ? (
              <>
                <FlashcardItem
                  card={{
                    id: selectedCards[currentCardIndex].id,
                    question: selectedCards[currentCardIndex].question,
                    answer: selectedCards[currentCardIndex].answer,
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
                      {currentCardIndex + 1} of {selectedCards.length}{" "}
                      flashcards
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleNextCard}
                    disabled={currentCardIndex === selectedCards.length - 1}
                    style={[styles.navButton, iosButton]}>
                    <MaterialIcons
                      name="chevron-right"
                      size={24}
                      color={
                        currentCardIndex === selectedCards.length - 1
                          ? theme.colors.mutedForeground
                          : theme.colors.primary
                      }
                    />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No flashcards found in this set
                </Text>
              </View>
            )}
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={[commonStyles.title, styles.title]}>Flashcards</Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/upload")}
                style={[styles.createButton, iosButton]}>
                <MaterialIcons
                  name="add"
                  size={24}
                  color={theme.colors.background}
                />
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.setsContainer}>
              <Text style={styles.sectionTitle}>Recent Sets</Text>
              <View style={styles.setsGrid}>
                {dummyData.flashcardSets.map((set) => (
                  <FlashcardSetCard
                    key={set.id}
                    set={set}
                    onClick={() => handleSetClick(set.id)}
                  />
                ))}
              </View>
            </View>
          </>
        )}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    marginBottom: 0,
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
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  buttonText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.background,
    fontWeight: "500" as const,
  },
  setsContainer: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "600" as const,
    marginBottom: theme.spacing.lg,
    color: theme.colors.foreground,
  },
  setsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.lg,
  },
});

export default Flashcards;
