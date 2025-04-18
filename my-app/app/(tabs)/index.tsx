import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../theme/theme";
import { commonStyles, iosButton, iosCard } from "../../utils/styles";
import { supabase } from "../../lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    // Get initial user state
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const features = [
    {
      icon: "cloud-upload",
      title: "Upload Documents",
      description:
        "Upload PDFs, Word documents, or text files to generate flashcards automatically",
    },
    {
      icon: "school",
      title: "Smart Flashcards",
      description: "AI-powered flashcards that help you learn more effectively",
    },
    {
      icon: "assessment",
      title: "Practice Tests",
      description: "Test your knowledge with automatically generated quizzes",
    },
  ];

  return (
    <ScrollView style={[commonStyles.container, styles.container]}>
      <View style={styles.header}>
        <Text
          style={[
            commonStyles.title,
            { fontSize: theme.typography.fontSize["4xl"] },
            styles.title,
            styles.centeredText,
          ]}>
          Welcome to Flashify
        </Text>
        <Text style={[styles.subtitle, styles.centeredText]}>
          Your AI-powered learning companion
        </Text>
      </View>

      {user ? (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            Welcome back, {user.email?.split("@")[0]}!
          </Text>
          <TouchableOpacity
            style={[styles.uploadButton, iosButton]}
            onPress={() => router.push("/(tabs)/upload")}>
            <MaterialIcons
              name="cloud-upload"
              size={24}
              color={theme.colors.background}
            />
            <Text style={styles.uploadButtonText}>Upload New Document</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Get Started</Text>
          <Text style={styles.authSubtitle}>
            Create an account to start learning
          </Text>
          <TouchableOpacity
            style={[
              styles.authButton,
              iosButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => router.push("/(auth)/login")}>
            <MaterialIcons
              name="login"
              size={24}
              color={theme.colors.background}
            />
            <Text
              style={[
                styles.authButtonText,
                { color: theme.colors.background },
              ]}>
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.authButton,
              iosButton,
              { backgroundColor: theme.colors.secondary },
            ]}
            onPress={() => router.push("/(auth)/signup")}>
            <MaterialIcons
              name="person-add"
              size={24}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.authButtonText, { color: theme.colors.primary }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Key Features</Text>
        {features.map((feature, index) => (
          <View key={index} style={[styles.featureCard, iosCard]}>
            <MaterialIcons
              name={feature.icon as any}
              size={32}
              color={theme.colors.primary}
            />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>
                {feature.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.howItWorksContainer}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={[styles.stepsCard, iosCard]}>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Upload your study material</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>
              AI generates flashcards automatically
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Study and track your progress</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  centeredText: {
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.mutedForeground,
  },
  authContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    alignItems: "center",
  },
  authTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  authSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.md,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    width: "100%",
  },
  authButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "500",
  },
  welcomeContainer: {
    padding: theme.spacing.lg,
    alignItems: "center",
    gap: theme.spacing.md,
  },
  welcomeText: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.foreground,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
  },
  uploadButtonText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.background,
    fontWeight: "500",
  },
  featuresContainer: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
    color: theme.colors.foreground,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "500",
    marginBottom: theme.spacing.xs,
    color: theme.colors.foreground,
  },
  featureDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  howItWorksContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  stepsCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    color: theme.colors.background,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "600",
  },
  stepText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
    flex: 1,
  },
});
