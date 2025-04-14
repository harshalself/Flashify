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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch (error) {
      setError("Invalid email or password");
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
        <Text style={[commonStyles.title, styles.headerTitle]}>Login</Text>
      </View>

      <View style={styles.content}>
        <Text style={[commonStyles.title, styles.title]}>
          Welcome to Flashify
        </Text>
        <Text style={styles.subtitle}>
          Login to create and study flashcards
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
                name="lock"
                size={20}
                color={theme.colors.mutedForeground}
              />
            </View>
            <TextInput
              style={[commonStyles.input, styles.input]}
              placeholder="••••••••"
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

          <TouchableOpacity
            style={[commonStyles.button, iosButton, styles.button]}
            onPress={handleSubmit}
            disabled={isLoading}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={commonStyles.buttonText}>Logging in...</Text>
              </View>
            ) : (
              <Text style={commonStyles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        <Link href="/signup" style={styles.link}>
          Don't have an account? Sign up
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

export default Login;
