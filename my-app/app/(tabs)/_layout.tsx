import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../theme/theme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark
            ? theme.colors.background
            : theme.colors.background,
        },
        headerTintColor: isDark
          ? theme.colors.foreground
          : theme.colors.foreground,
        tabBarStyle: {
          backgroundColor: isDark
            ? theme.colors.background
            : theme.colors.background,
          borderTopColor: isDark ? theme.colors.border : theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: isDark
          ? theme.colors.mutedForeground
          : theme.colors.mutedForeground,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="flashcards"
        options={{
          title: "Flashcards",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="school" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tests"
        options={{
          title: "Tests",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="assignment" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="cloud-upload" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
