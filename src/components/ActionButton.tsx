import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { fonts, radius, space, usePalette } from "@/constants/theme";

export type ButtonVariant =
  "primary" | "secondary" | "outline" | "ghost" | "danger";

export function ActionButton({
  label,
  onPress,
  disabled = false,
  variant = "primary",
  icon,
  compact = false,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  compact?: boolean;
  accessibilityHint?: string;
}) {
  const c = usePalette();
  const look = {
    primary: {
      bg: c.primary,
      pressed: c.primaryPressed,
      fg: c.onPrimary,
      border: c.primary,
    },
    secondary: {
      bg: c.mint100,
      pressed: c.mint200,
      fg: c.primary,
      border: c.mint100,
    },
    outline: {
      bg: "transparent",
      pressed: c.canvasSoft,
      fg: c.ink,
      border: c.hairlineStrong,
    },
    ghost: {
      bg: "transparent",
      pressed: c.mint50,
      fg: c.primary,
      border: "transparent",
    },
    danger: {
      bg: "transparent",
      pressed: c.errorSurface,
      fg: c.error,
      border: c.hairlineStrong,
    },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      onPress={onPress}
      hitSlop={compact ? 6 : undefined}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        variant === "outline" || variant === "danger" ? styles.rounded : null,
        {
          backgroundColor: pressed ? look.pressed : look.bg,
          borderColor: look.border,
        },
        disabled && { opacity: 0.4 },
      ]}
    >
      <View style={styles.row}>
        {icon && (
          <Ionicons name={icon} size={compact ? 16 : 18} color={look.fg} />
        )}
        <ThemedText
          style={[
            styles.label,
            variant === "primary" && styles.upper,
            { color: look.fg },
          ]}
        >
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    maxWidth: "100%",
    minWidth: 0,
    borderRadius: radius.control,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: space.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  compact: {
    minHeight: 38,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
  },
  rounded: { borderRadius: radius.card },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    maxWidth: "100%",
    flexShrink: 1,
  },
  label: {
    flexShrink: 1,
    minWidth: 0,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  upper: { textTransform: "uppercase", letterSpacing: 0.6 },
});
