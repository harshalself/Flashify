import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AuthCheck from "../../components/AuthCheck";
import { useAuth } from "../../context/AuthContext";
import { theme } from "../../theme/theme";
import { commonStyles, iosCard, iosButton } from "../../utils/styles";

const Settings = () => {
  const { user, logout } = useAuth();

  return (
    <AuthCheck>
      <View style={[commonStyles.container, styles.container]}>
        <Text style={[commonStyles.title, styles.title]}>Settings</Text>

        <View style={[styles.section, iosCard]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account</Text>
          </View>

          <View style={styles.sectionContent}>
            <View style={styles.userInfo}>
              <View style={styles.iconContainer}>
                <MaterialIcons
                  name="person"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View>
                <Text style={styles.username}>{user?.username}</Text>
                <Text style={styles.email}>{user?.email}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={logout}
              style={[styles.logoutButton, iosButton]}>
              <MaterialIcons
                name="logout"
                size={16}
                color={theme.colors.primary}
              />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, iosCard]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>About</Text>
          </View>

          <View style={styles.sectionContent}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>
      </View>
    </AuthCheck>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "600" as const,
    color: theme.colors.foreground,
  },
  sectionContent: {
    padding: theme.spacing.md,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  iconContainer: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.md,
    marginRight: theme.spacing.lg,
  },
  username: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: "500" as const,
    color: theme.colors.foreground,
  },
  email: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
  },
  logoutText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.primary,
    fontWeight: "500" as const,
  },
  versionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
});

export default Settings;
