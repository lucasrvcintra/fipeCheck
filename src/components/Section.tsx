import { View, StyleSheet } from "react-native";
import type { ReactNode } from "react";
import { ThemedText } from "./ThemedText";
import { space, usePalette } from "@/constants/theme";

export function Section({
  step,
  title,
  description,
  children,
  right,
}: {
  step?: string;
  title: string;
  description?: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  const c = usePalette();
  return (
    <View style={[styles.section, { borderTopColor: c.hairline }]}>
      <View style={styles.head}>
        <View style={styles.titles}>
          {step && (
            <ThemedText variant="eyebrow" tone="primary">
              {step}
            </ThemedText>
          )}
          <ThemedText variant="h2">{title}</ThemedText>
        </View>
        {right}
      </View>
      {description && (
        <ThemedText variant="bodySm" tone="muted">
          {description}
        </ThemedText>
      )}
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  section: { gap: space.lg, borderTopWidth: 1, paddingTop: space.xxl },
  head: { flexDirection: "row", alignItems: "center", gap: space.md },
  titles: { flex: 1, gap: 2 },
});
