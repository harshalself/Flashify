import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../theme/theme";
import { commonStyles, iosButton, iosCard } from "../utils/styles";

interface TestQuestionProps {
  question: string;
  options: string[];
  correctAnswer: number;
  onSelect: (index: number) => void;
  selectedAnswer?: number;
}

const TestQuestion: React.FC<TestQuestionProps> = ({
  question,
  options,
  correctAnswer,
  onSelect,
  selectedAnswer,
}) => {
  return (
    <View style={[styles.container, iosCard]}>
      <Text style={[commonStyles.title, styles.question]}>{question}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              iosButton,
              selectedAnswer === index && styles.selectedOption,
            ]}
            onPress={() => onSelect(index)}>
            <Text
              style={[
                styles.optionText,
                selectedAnswer === index && styles.selectedOptionText,
              ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  question: {
    marginBottom: theme.spacing.lg,
    fontSize: theme.typography.fontSize.lg,
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  option: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
  },
  selectedOption: {
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
  },
  selectedOptionText: {
    color: theme.colors.background,
  },
});

export default TestQuestion;
