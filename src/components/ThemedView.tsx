import { View, type ViewProps } from "react-native";
import { useTheme } from "expo-router/react-navigation";

export function ThemedView({ style, ...props }: ViewProps) {
  const { colors } = useTheme();
  return (
    <View {...props} style={[{ backgroundColor: colors.background }, style]} />
  );
}
