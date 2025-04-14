import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../theme/theme";
import { commonStyles, iosCard } from "../utils/styles";

interface FlashcardItemProps {
  card: {
    id: string;
    question: string;
    answer: string;
    isFlipped: boolean;
  };
  onFlip: () => void;
}

const FlashcardItem = ({ card, onFlip }: FlashcardItemProps) => {
  return (
    <TouchableOpacity onPress={onFlip} style={[styles.card, iosCard]}>
      <View style={styles.content}>
        <Text style={styles.text}>
          {card.isFlipped ? card.answer : card.question}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.hint}>
            {card.isFlipped ? "Tap to see question" : "Tap to see answer"}
          </Text>
          <MaterialIcons
            name={card.isFlipped ? "undo" : "redo"}
            size={20}
            color={theme.colors.mutedForeground}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  content: {
    padding: theme.spacing.lg,
  },
  text: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hint: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
});

export default FlashcardItem;
