import { StyleSheet } from "react-native";

export const colors = {
  // Light theme colors
  background: "#F8FDFF", // hsl(195, 100%, 98%)
  foreground: "#0D4D66", // hsl(195, 80%, 20%)
  card: "#FFFFFF",
  cardForeground: "#0D4D66",
  popover: "#FFFFFF",
  popoverForeground: "#0D4D66",
  primary: "#00B2D6", // hsl(195, 100%, 42%)
  primaryForeground: "#FFFFFF",
  secondary: "#F0F9FC", // hsl(195, 100%, 96%)
  secondaryForeground: "#0D4D66",
  muted: "#F5F5F5", // hsl(195, 10%, 96%)
  mutedForeground: "#666666", // hsl(195, 40%, 40%)
  accent: "#00D6D6", // hsl(187, 100%, 42%)
  accentForeground: "#FFFFFF",
  destructive: "#DC2626", // hsl(0, 84.2%, 60.2%)
  destructiveForeground: "#FAFAFA",
  border: "#E5E5E5", // hsl(195, 20%, 90%)
  input: "#E5E5E5",
  ring: "#00B2D6",

  // Dark theme colors
  darkBackground: "#0A1A1F", // hsl(195, 80%, 10%)
  darkForeground: "#F8FDFF", // hsl(195, 10%, 98%)
  darkCard: "#0D262D", // hsl(195, 80%, 12%)
  darkCardForeground: "#F8FDFF",
  darkPopover: "#0D262D",
  darkPopoverForeground: "#F8FDFF",
  darkPrimary: "#00B2D6",
  darkPrimaryForeground: "#FFFFFF",
  darkSecondary: "#1A3A40", // hsl(195, 50%, 20%)
  darkSecondaryForeground: "#FAFAFA",
  darkMuted: "#1A3A40",
  darkMutedForeground: "#B3B3B3", // hsl(195, 40%, 70%)
  darkAccent: "#00D6D6",
  darkAccentForeground: "#FFFFFF",
  darkDestructive: "#991B1B", // hsl(0, 62.8%, 30.6%)
  darkDestructiveForeground: "#FAFAFA",
  darkBorder: "#1A3A40",
  darkInput: "#1A3A40",
  darkRing: "#00B2D6",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999,
};

export const typography = {
  fontFamily: {
    sans: "System",
    serif: "System",
    mono: "System",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
  },
  fontWeight: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },
};

export const shadows = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    shadowColor: "#00B2D6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  floating: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
});

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};
