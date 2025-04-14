import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { theme } from "../theme/theme";
import { commonStyles, iosCard } from "../utils/styles";

interface AuthCheckProps {
  children: React.ReactNode;
}

const AuthCheck = ({ children }: AuthCheckProps) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <View style={[commonStyles.container, styles.container]}>
        <View style={[styles.card, iosCard]}>
          <MaterialIcons
            name="lock"
            size={48}
            color={theme.colors.primary}
            style={styles.icon}
          />
          <Text style={[commonStyles.title, styles.title]}>
            Authentication Required
          </Text>
          <Text style={styles.message}>
            Please sign in to access this content.
          </Text>
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  icon: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  message: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    textAlign: "center",
  },
});

export default AuthCheck;
