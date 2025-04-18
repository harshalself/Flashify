import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../../theme/theme";
import { iosCard } from "../../utils/styles";

interface FlashcardSetCardProps {
  set: {
    id: string;
    title: string;
    description: string;
    cardCount: number;
    color: string;
  };
  onClick: () => void;
}

const FlashcardSetCard: React.FC<FlashcardSetCardProps> = ({
  set,
  onClick,
}) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={[styles.card, iosCard, { backgroundColor: `${set.color}20` }]}>
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
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  content: {
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "600" as const,
    color: theme.colors.foreground,
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  count: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.mutedForeground,
  },
});

export default FlashcardSetCard;
