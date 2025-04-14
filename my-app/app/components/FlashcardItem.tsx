import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Flashcard } from "../../types";

interface FlashcardItemProps {
  flashcard: Flashcard;
  onNext?: () => void;
  onPrev?: () => void;
}

const FlashcardItem: React.FC<FlashcardItemProps> = ({
  flashcard,
  onNext,
  onPrev,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleFlip} style={styles.card}>
        <Text style={styles.text}>
          {isFlipped ? flashcard.answer : flashcard.question}
        </Text>
        <Text style={styles.hint}>{isFlipped ? "Question" : "Answer"}</Text>
      </TouchableOpacity>

      <View style={styles.navigation}>
        {onPrev && (
          <TouchableOpacity onPress={onPrev} style={styles.navButton}>
            <MaterialIcons name="chevron-left" size={24} color="#06b6d4" />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleFlip} style={styles.flipButton}>
          <MaterialIcons name="flip" size={24} color="#06b6d4" />
        </TouchableOpacity>

        {onNext && (
          <TouchableOpacity onPress={onNext} style={styles.navButton}>
            <MaterialIcons name="chevron-right" size={24} color="#06b6d4" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: "#666",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navButton: {
    padding: 8,
  },
  flipButton: {
    padding: 8,
  },
});

export default FlashcardItem;
