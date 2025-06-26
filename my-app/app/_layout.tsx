import { Redirect, Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import "react-native-url-polyfill/auto";
import { Buffer } from "buffer";
import process from "process";

global.Buffer = Buffer;
global.process = process;

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
            },
            headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="[404]" options={{ title: "Not Found" }} />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
