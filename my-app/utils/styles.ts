import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from "react-native";
import { theme } from "../theme/theme";

type Style = ViewStyle | TextStyle | ImageStyle;

export const createStyles = <T extends StyleSheet.NamedStyles<T>>(
  styles: T
) => {
  return StyleSheet.create(styles);
};

export const cn = (...styles: (Style | undefined)[]): Style => {
  return Object.assign({}, ...styles.filter(Boolean));
};

export const iosCard = {
  backgroundColor: theme.colors.card,
  borderRadius: theme.borderRadius.lg,
  borderWidth: 1,
  borderColor: theme.colors.border,
  ...theme.shadows.card,
};

export const iosButton = {
  borderRadius: theme.borderRadius.full,
  ...theme.shadows.button,
};

export const floatingElement = {
  ...theme.shadows.floating,
};

export const commonStyles = createStyles({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: "700" as const,
    color: theme.colors.foreground,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: theme.colors.primaryForeground,
    fontSize: theme.typography.fontSize.base,
    fontWeight: "500" as const,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.card,
  },
  input: {
    backgroundColor: theme.colors.input,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
  },
});
