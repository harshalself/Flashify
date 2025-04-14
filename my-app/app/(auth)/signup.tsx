import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router, Link } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../theme/theme";
import { commonStyles, iosCard, iosButton } from "../../utils/styles";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async () => {
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, username, password);
      router.replace("/(tabs)");
    } catch (error) {
      setError("Failed to create an account");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={[commonStyles.container, styles.container]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, iosButton]}>
          <MaterialIcons
            name="arrow-back"
            size={20}
            color={theme.colors.foreground}
          />
        </TouchableOpacity>
        <Text style={[commonStyles.title, styles.headerTitle]}>Sign Up</Text>
      </View>

      <View style={styles.content}>
        <Text style={[commonStyles.title, styles.title]}>
          Create an Account
        </Text>
        <Text style={styles.subtitle}>
          Join Flashify to create and study flashcards
        </Text>

        {error && (
          <View style={[styles.errorContainer, iosCard]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={[styles.formContainer, iosCard]}>
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="email"
                size={20}
                color={theme.colors.mutedForeground}
              />
            </View>
            <TextInput
              style={[commonStyles.input, styles.input]}
              placeholder="your@email.com"
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={theme.colors.mutedForeground}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="person"
                size={20}
                color={theme.colors.mutedForeground}
              />
            </View>
            <TextInput
              style={[commonStyles.input, styles.input]}
              placeholder="Username"
              value={username}
              onChangeText={(text) => setUsername(text)}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={theme.colors.mutedForeground}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="lock"
                size={20}
                color={theme.colors.mutedForeground}
              />
            </View>
            <TextInput
              style={[commonStyles.input, styles.input]}
              placeholder="Password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={!showPassword}
              placeholderTextColor={theme.colors.mutedForeground}
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              {showPassword ? (
                <MaterialIcons
                  name="visibility"
                  size={20}
                  color={theme.colors.mutedForeground}
                />
              ) : (
                <MaterialIcons
                  name="visibility-off"
                  size={20}
                  color={theme.colors.mutedForeground}
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="lock"
                size={20}
                color={theme.colors.mutedForeground}
              />
            </View>
            <TextInput
              style={[commonStyles.input, styles.input]}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
              secureTextEntry={!showPassword}
              placeholderTextColor={theme.colors.mutedForeground}
            />
          </View>

          <TouchableOpacity
            style={[commonStyles.button, iosButton, styles.button]}
            onPress={handleSubmit}
            disabled={isLoading}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={commonStyles.buttonText}>Creating account...</Text>
              </View>
            ) : (
              <Text style={commonStyles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
        </View>

        <Link href="/login" style={styles.link}>
          Already have an account? Login
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.secondary,
  },
  headerTitle: {
    marginLeft: theme.spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.xl,
  },
  errorContainer: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.destructive + "10",
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: theme.typography.fontSize.sm,
  },
  formContainer: {
    width: "100%",
    padding: theme.spacing.lg,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    padding: theme.spacing.sm,
  },
  input: {
    flex: 1,
  },
  button: {
    marginTop: theme.spacing.md,
  },
  loadingContainer: {
    padding: theme.spacing.sm,
  },
  link: {
    color: theme.colors.primary,
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize.base,
  },
});

export default Signup;
