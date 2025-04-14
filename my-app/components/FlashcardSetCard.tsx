import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../theme/theme";
import { commonStyles, iosCard } from "../utils/styles";

interface FlashcardSetCardProps {
  set: {
    id: string;
    title: string;
    description: string;
    cardCount: number;
    createdAt: string;
    lastModified: string;
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
      style={[
        styles.card,
        iosCard,
        { borderLeftWidth: 4, borderLeftColor: set.color },
      ]}>
      <View style={styles.content}>
        <Text style={styles.title}>{set.title}</Text>
        <Text style={styles.description}>{set.description}</Text>
        <View style={styles.footer}>
          <Text style={styles.cardCount}>{set.cardCount} cards</Text>
          <MaterialIcons
            name="chevron-right"
            size={24}
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
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "600" as const,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
});

export default FlashcardSetCard;
