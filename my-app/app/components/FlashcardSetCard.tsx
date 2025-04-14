import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FlashcardSet } from "../../types";

interface FlashcardSetCardProps {
  set: FlashcardSet;
  onClick: () => void;
}

const FlashcardSetCard: React.FC<FlashcardSetCardProps> = ({
  set,
  onClick,
}) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={[styles.card, { backgroundColor: set.color + "20" }]}>
      <View style={styles.content}>
        <Text style={styles.title}>{set.title}</Text>
        <Text style={styles.description}>{set.description}</Text>
        <Text style={styles.count}>{set.cardCount} cards</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  content: {
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
  count: {
    fontSize: 12,
    color: "#666",
  },
});

export default FlashcardSetCard;
