import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { ActionButton } from "./ActionButton";
import { radius, space, usePalette } from "@/constants/theme";

type Tone = "info" | "tip" | "error" | "success";

/** Mensagens de estado: carregando, aviso, dica, erro ou sucesso. */
export function Feedback({
  message,
  title,
  loading,
  onRetry,
  tone,
}: {
  message: string;
  title?: string;
  loading?: boolean;
  onRetry?: () => void;
  tone?: Tone;
}) {
  const c = usePalette();
  if (loading)
    return (
      <View
        style={styles.loading}
        accessibilityLiveRegion="polite"
        accessibilityRole="progressbar"
      >
        <ActivityIndicator color={c.primary} />
        <ThemedText variant="bodySm" tone="muted" style={{ flex: 1 }}>
          {message}
        </ThemedText>
      </View>
    );
  const kind: Tone = tone ?? (onRetry ? "error" : "info");
  const look = {
    info: {
      bg: c.mint50,
      fg: c.forest,
      icon: "information-circle" as const,
      iconColor: c.primary,
    },
    tip: {
      bg: c.limePanel,
      fg: c.onLimePanel,
      icon: "bulb" as const,
      iconColor: c.onLimePanel,
    },
    error: {
      bg: c.errorSurface,
      fg: c.error,
      icon: "alert-circle" as const,
      iconColor: c.error,
    },
    success: {
      bg: c.mint100,
      fg: c.forest,
      icon: "checkmark-circle" as const,
      iconColor: c.primary,
    },
  }[kind];
  const text = kind === "error" ? c.ink : c.body;
  return (
    <View
      style={[styles.box, { backgroundColor: look.bg }]}
      accessibilityLiveRegion={kind === "error" ? "assertive" : "polite"}
      accessibilityRole={kind === "error" ? "alert" : undefined}
    >
      <View style={styles.row}>
        <Ionicons name={look.icon} size={20} color={look.iconColor} />
        <View style={{ flex: 1, gap: 2 }}>
          {title && (
            <ThemedText variant="label" style={{ color: text }}>
              {title}
            </ThemedText>
          )}
          <ThemedText variant="bodySm" style={{ color: text }}>
            {message}
          </ThemedText>
        </View>
      </View>
      {onRetry && (
        <ActionButton
          compact
          variant="outline"
          icon="refresh"
          label="Tentar novamente"
          onPress={onRetry}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: space.sm,
  },
  box: { borderRadius: radius.card, padding: space.md, gap: space.md },
  row: { flexDirection: "row", gap: space.md, alignItems: "flex-start" },
});
