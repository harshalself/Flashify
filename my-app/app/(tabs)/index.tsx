import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../theme/theme";
import { commonStyles, iosCard, iosButton } from "../../utils/styles";

const Home = () => {
  const { isAuthenticated } = useAuth();

  const handleNavigate = (path: string) => {
    if (isAuthenticated) {
      router.push(path);
    } else {
      router.push("/(auth)/login");
    }
  };

  return (
    <View style={[commonStyles.container, styles.container]}>
      <Text style={[commonStyles.title, styles.title]}>
        Welcome to Flashify
      </Text>
      <Text style={styles.subtitle}>Create and study flashcards with ease</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => handleNavigate("/(tabs)/upload")}
          style={[styles.button, iosButton]}>
          <MaterialIcons
            name="cloud-upload"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={styles.buttonText}>Upload Document</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleNavigate("/(tabs)/flashcards")}
          style={[styles.button, iosButton]}>
          <MaterialIcons name="style" size={24} color={theme.colors.primary} />
          <Text style={styles.buttonText}>Flashcards</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleNavigate("/(tabs)/tests")}
          style={[styles.button, iosButton]}>
          <MaterialIcons name="quiz" size={24} color={theme.colors.primary} />
          <Text style={styles.buttonText}>Tests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleNavigate("/(tabs)/settings")}
          style={[styles.button, iosButton]}>
          <MaterialIcons
            name="settings"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.xl,
  },
  buttonContainer: {
    gap: theme.spacing.md,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.secondary,
  },
  buttonText: {
    marginLeft: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    fontWeight: "500" as const,
  },
});

export default Home;
