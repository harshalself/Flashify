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
import TestSeriesCard from "../../components/TestSeriesCard";
import TestQuestion from "../../components/TestQuestion";
import { cn } from "@/lib/utils";
import { theme } from "../../theme/theme";
import { commonStyles } from "../../utils/styles";

const Tests = () => {
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const selectedSeries = selectedSeriesId
    ? dummyData.testSeries.find((series) => series.id === selectedSeriesId)
    : null;

  const selectedQuestions = selectedSeriesId
    ? dummyData.testQuestions[selectedSeriesId] || []
    : [];

  const handleSeriesClick = (seriesId: string) => {
    setSelectedSeriesId(seriesId);
    setSelectedAnswers(
      Array(dummyData.testQuestions[seriesId].length).fill(null)
    );
    setShowResults(false);
    setScore(null);
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmitTest = () => {
    // Calculate score
    let correctCount = 0;

    selectedQuestions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round(
      (correctCount / selectedQuestions.length) * 100
    );
    setScore(finalScore);
    setShowResults(true);
  };

  const handleRetakeTest = () => {
    setSelectedAnswers(Array(selectedQuestions.length).fill(null));
    setShowResults(false);
    setScore(null);
  };

  const allQuestionsAnswered = selectedAnswers.every(
    (answer) => answer !== null
  );

  return (
    <AuthCheck>
      <ScrollView style={[commonStyles.container, styles.container]}>
        <View style={styles.content}>
          {selectedSeriesId ? (
            <View>
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => setSelectedSeriesId(null)}
                  style={styles.backButton}>
                  <MaterialIcons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>{selectedSeries?.title}</Text>
              </View>

              {showResults ? (
                <View style={styles.resultContainer}>
                  <View style={styles.scoreContainer}>
                    <View
                      style={[
                        styles.scoreIcon,
                        score && score >= 70
                          ? styles.scoreIconSuccess
                          : styles.scoreIconError,
                      ]}>
                      <MaterialIcons name="check" size={24} color="#fff" />
                    </View>
                  </View>
                  <Text style={styles.scoreText}>Your Score: {score}%</Text>
                  <Text style={styles.resultText}>
                    You correctly answered{" "}
                    {
                      selectedAnswers.filter(
                        (answer, index) =>
                          answer === selectedQuestions[index].correctAnswer
                      ).length
                    }{" "}
                    out of {selectedQuestions.length} questions
                  </Text>
                  <TouchableOpacity
                    onPress={handleRetakeTest}
                    style={styles.retakeButton}>
                    <Text style={styles.retakeButtonText}>Retake Test</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.questionContainer}>
                  <View style={styles.questionList}>
                    {selectedQuestions.map((question, index) => (
                      <TestQuestion
                        key={question.id}
                        question={question.question}
                        options={question.options}
                        correctAnswer={question.correctAnswer}
                        selectedAnswer={selectedAnswers[index]}
                        onSelect={(answerIndex) =>
                          handleAnswerSelect(index, answerIndex)
                        }
                      />
                    ))}
                  </View>

                  <View style={styles.submitContainer}>
                    <TouchableOpacity
                      onPress={handleSubmitTest}
                      disabled={!allQuestionsAnswered}
                      style={[
                        styles.submitButton,
                        !allQuestionsAnswered && styles.submitButtonDisabled,
                      ]}>
                      <Text style={styles.submitButtonText}>Submit Test</Text>
                    </TouchableOpacity>
                    {!allQuestionsAnswered && (
                      <Text style={styles.hintText}>
                        Answer all questions to submit
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Test Series</Text>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/upload")}
                  style={styles.createButton}>
                  <MaterialIcons name="add" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Create</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.seriesContainer}>
                {dummyData.testSeries.map((series) => (
                  <TestSeriesCard
                    key={series.id}
                    series={series}
                    onClick={() => handleSeriesClick(series.id)}
                  />
                ))}
              </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreIconSuccess: {
    backgroundColor: "#4CAF50",
  },
  scoreIconError: {
    backgroundColor: "#F44336",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 16,
  },
  retakeButton: {
    padding: 16,
    backgroundColor: "#06b6d4",
    borderRadius: 8,
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  questionContainer: {
    flex: 1,
  },
  questionList: {
    flex: 1,
  },
  submitContainer: {
    padding: 16,
  },
  submitButton: {
    backgroundColor: "#06b6d4",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  hintText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  seriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#06b6d4",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    marginLeft: 8,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Tests;
