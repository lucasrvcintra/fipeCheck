import { View, type ViewProps } from "react-native";
import { usePalette } from "@/constants/theme";

export function ThemedView({ style, ...props }: ViewProps) {
  const c = usePalette();
  return <View {...props} style={[{ backgroundColor: c.canvas }, style]} />;
}
