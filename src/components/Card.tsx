import { View, StyleSheet, type ViewProps } from "react-native";
import { radius, space, usePalette } from "@/constants/theme";

export function Card({
  tone = "plain",
  style,
  ...props
}: ViewProps & { tone?: "plain" | "mint" | "soft" }) {
  const c = usePalette();
  const bg = { plain: c.canvas, mint: c.mint50, soft: c.canvasSoft }[tone];
  const border = tone === "plain" ? c.hairlineStrong : "transparent";
  return (
    <View
      {...props}
      style={[styles.card, { backgroundColor: bg, borderColor: border }, style]}
    />
  );
}
const styles = StyleSheet.create({
  card: {
    padding: space.lg,
    borderWidth: 1,
    borderRadius: radius.card,
    gap: space.md,
  },
});
