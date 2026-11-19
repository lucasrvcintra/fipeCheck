import { Text, type TextProps } from "react-native";
import { useTheme } from "expo-router/react-navigation";

export function ThemedText({ style, ...props }: TextProps) {
  const { colors } = useTheme();
  return (
    <Text
      {...props}
      style={[{ color: colors.text, fontSize: 16, lineHeight: 24 }, style]}
    />
  );
}
