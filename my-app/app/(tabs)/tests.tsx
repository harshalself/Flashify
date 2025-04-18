import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AuthCheck from "../../components/AuthCheck";
import TestQuestion from "../../components/TestQuestion";
import { theme } from "../../theme/theme";
import { commonStyles, iosButton, iosCard } from "../../utils/styles";
import { supabase } from "../../lib/supabase";

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  created_at: string;
  user_id: string;
}

interface Test {
  id: string;
  title: string;
  set_id: string;
  created_at: string;
}

interface TestQuestion {
  id: string;
  question: string;
  correct_answer: string;
  options: string[];
  order_index: number;
}

const Tests = () => {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetSelection, setShowSetSelection] = useState(false);

  useEffect(() => {
    fetchFlashcardSets();
    fetchTests();
  }, []);

  const fetchFlashcardSets = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No authenticated user");

      const { data: sets, error: setsError } = await supabase
        .from("flashcard_sets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (setsError) throw setsError;
      setFlashcardSets(sets || []);
    } catch (error) {
      console.error("Error fetching flashcard sets:", error);
      Alert.alert("Error", "Failed to load flashcard sets");
    }
  };

  const fetchTests = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No authenticated user");

      const { data: userTests, error: testsError } = await supabase
        .from("tests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (testsError) throw testsError;
      setTests(userTests || []);
    } catch (error) {
      console.error("Error fetching tests:", error);
      Alert.alert("Error", "Failed to load tests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTest = async (setId: string) => {
    try {
      setIsLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No authenticated user");

      // Fetch flashcards for the selected set
      const { data: flashcards, error: flashcardsError } = await supabase
        .from("flashcards")
        .select("*")
        .eq("set_id", setId)
        .order("order_index");

      if (flashcardsError) throw flashcardsError;
      if (!flashcards || flashcards.length === 0) {
        Alert.alert("Error", "No flashcards found in this set");
        return;
      }

      // Create test
      const { data: test, error: testError } = await supabase
        .from("tests")
        .insert({
          user_id: user.id,
          set_id: setId,
          title: `Test from ${
            flashcardSets.find((set) => set.id === setId)?.title
          }`,
        })
        .select()
        .single();

      if (testError) throw testError;

      // Create test questions
      const questions = flashcards.map((card, index) => {
        const options = [card.answer];
        // Generate 3 random incorrect answers
        while (options.length < 4) {
          const randomCard =
            flashcards[Math.floor(Math.random() * flashcards.length)];
          if (!options.includes(randomCard.answer)) {
            options.push(randomCard.answer);
          }
        }
        // Shuffle options
        options.sort(() => Math.random() - 0.5);
        const correctIndex = options.indexOf(card.answer);

        return {
          test_id: test.id,
          question: card.question,
          correct_answer: card.answer,
          options: options,
          order_index: index,
        };
      });

      const { error: questionsError } = await supabase
        .from("test_questions")
        .insert(questions);

      if (questionsError) throw questionsError;

      setShowSetSelection(false);
      await fetchTests();
    } catch (error) {
      console.error("Error creating test:", error);
      Alert.alert("Error", "Failed to create test");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestClick = async (testId: string) => {
    try {
      setIsLoading(true);
      const { data: questions, error } = await supabase
        .from("test_questions")
        .select("*")
        .eq("test_id", testId)
        .order("order_index");

      if (error) throw error;

      setTestQuestions(questions || []);
      setSelectedAnswers(Array(questions?.length || 0).fill(null));
      setSelectedTest(tests.find((test) => test.id === testId) || null);
      setShowResults(false);
      setScore(null);
    } catch (error) {
      console.error("Error fetching test questions:", error);
      Alert.alert("Error", "Failed to load test questions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmitTest = () => {
    let correctCount = 0;
    testQuestions.forEach((question, index) => {
      if (
        selectedAnswers[index] ===
        question.options.indexOf(question.correct_answer)
      ) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / testQuestions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
  };

  const handleRetakeTest = () => {
    setSelectedAnswers(Array(testQuestions.length).fill(null));
    setShowResults(false);
    setScore(null);
  };

  const allQuestionsAnswered = selectedAnswers.every(
    (answer) => answer !== null
  );

  if (isLoading) {
    return (
      <View style={[commonStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthCheck>
      <ScrollView style={[commonStyles.container, styles.container]}>
        <View style={styles.content}>
          {selectedTest ? (
            <View>
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => setSelectedTest(null)}
                  style={styles.backButton}>
                  <MaterialIcons
                    name="arrow-back"
                    size={24}
                    color={theme.colors.foreground}
                  />
                </TouchableOpacity>
                <Text style={styles.title}>{selectedTest.title}</Text>
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
                      <MaterialIcons
                        name="check"
                        size={24}
                        color={theme.colors.background}
                      />
                    </View>
                  </View>
                  <Text style={styles.scoreText}>Your Score: {score}%</Text>
                  <Text style={styles.resultText}>
                    You correctly answered{" "}
                    {
                      selectedAnswers.filter(
                        (answer, index) =>
                          answer ===
                          testQuestions[index].options.indexOf(
                            testQuestions[index].correct_answer
                          )
                      ).length
                    }{" "}
                    out of {testQuestions.length} questions
                  </Text>
                  <TouchableOpacity
                    onPress={handleRetakeTest}
                    style={[styles.retakeButton, iosButton]}>
                    <Text style={styles.retakeButtonText}>Retake Test</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.questionContainer}>
                  <View style={styles.questionList}>
                    {testQuestions.map((question, index) => (
                      <TestQuestion
                        key={question.id}
                        question={question.question}
                        options={question.options}
                        correctAnswer={question.options.indexOf(
                          question.correct_answer
                        )}
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
                        iosButton,
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
                <Text style={styles.title}>Tests</Text>
                <TouchableOpacity
                  onPress={() => setShowSetSelection(true)}
                  style={[styles.createButton, iosButton]}>
                  <MaterialIcons
                    name="add"
                    size={24}
                    color={theme.colors.background}
                  />
                  <Text style={styles.buttonText}>Create</Text>
                </TouchableOpacity>
              </View>

              {showSetSelection ? (
                <View style={styles.setsContainer}>
                  <Text style={styles.setsTitle}>Select a Flashcard Set</Text>
                  {flashcardSets.map((set) => (
                    <TouchableOpacity
                      key={set.id}
                      style={[styles.setCard, iosCard]}
                      onPress={() => handleCreateTest(set.id)}>
                      <Text style={styles.setTitle}>{set.title}</Text>
                      <Text style={styles.setDate}>
                        {new Date(set.created_at).toLocaleDateString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.testsContainer}>
                  {tests.map((test) => (
                    <TouchableOpacity
                      key={test.id}
                      style={[styles.testCard, iosCard]}
                      onPress={() => handleTestClick(test.id)}>
                      <Text style={styles.testTitle}>{test.title}</Text>
                      <Text style={styles.testDate}>
                        {new Date(test.created_at).toLocaleDateString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
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
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
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
    fontSize: theme.typography.fontSize.xl,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  scoreIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreIconSuccess: {
    backgroundColor: theme.colors.success,
  },
  scoreIconError: {
    backgroundColor: theme.colors.error,
  },
  scoreText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  resultText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  retakeButton: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
  },
  retakeButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: "600",
    color: theme.colors.background,
  },
  questionContainer: {
    flex: 1,
  },
  questionList: {
    flex: 1,
  },
  submitContainer: {
    padding: theme.spacing.lg,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.muted,
  },
  submitButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: "600",
    color: theme.colors.background,
  },
  hintText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    textAlign: "center",
    marginTop: theme.spacing.sm,
  },
  setsContainer: {
    gap: theme.spacing.md,
  },
  setsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: theme.spacing.md,
  },
  setCard: {
    padding: theme.spacing.lg,
  },
  setTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: "500",
    color: theme.colors.foreground,
  },
  setDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.sm,
  },
  testsContainer: {
    gap: theme.spacing.md,
  },
  testCard: {
    padding: theme.spacing.lg,
  },
  testTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: "500",
    color: theme.colors.foreground,
  },
  testDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.sm,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  buttonText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.background,
    fontWeight: "600",
  },
});

export default Tests;
