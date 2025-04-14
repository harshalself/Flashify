import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { TestSeries } from "../types";
import { MaterialIcons } from "@expo/vector-icons";
import { formatDistance } from "date-fns";

interface TestSeriesCardProps {
  series: TestSeries;
  onClick: () => void;
}

const TestSeriesCard = ({ series, onClick }: TestSeriesCardProps) => {
  const formattedDate = formatDistance(
    new Date(series.lastModified),
    new Date(),
    { addSuffix: true }
  );

  return (
    <TouchableOpacity onPress={onClick} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{series.title}</Text>
            <Text style={styles.description}>{series.description}</Text>
          </View>
          <View style={styles.iconContainer}>
            <MaterialIcons name="assignment" size={20} color="#06b6d4" />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {series.questionCount} questions
          </Text>
          <Text style={styles.footerText}>Created {formattedDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    overflow: "hidden",
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
  iconContainer: {
    borderRadius: 20,
    padding: 8,
    backgroundColor: "#e6fffa",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
});

export default TestSeriesCard;
