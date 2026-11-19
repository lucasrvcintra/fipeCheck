import { Text, type TextProps } from "react-native";
import { type, usePalette, type Palette } from "@/constants/theme";

type Variant = keyof typeof type;
type Tone = "ink" | "body" | "muted" | "primary" | "error" | "onPrimary";

export function ThemedText({
  style,
  variant = "body",
  tone,
  ...props
}: TextProps & { variant?: Variant; tone?: Tone }) {
  const c = usePalette();
  const headings: Variant[] = ["display", "h1", "h2", "h3", "number", "label"];
  const color: keyof Palette =
    tone ?? (headings.includes(variant) ? "ink" : "body");
  return (
    <Text
      {...props}
      accessibilityRole={
        props.accessibilityRole ??
        (["display", "h1", "h2"].includes(variant) ? "header" : undefined)
      }
      style={[type[variant], { color: c[color] }, style]}
    />
  );
}
