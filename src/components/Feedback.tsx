import { ActivityIndicator, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ActionButton } from "./ActionButton";
export function Feedback({
  message,
  loading,
  onRetry,
}: {
  message: string;
  loading?: boolean;
  onRetry?: () => void;
}) {
  return (
    <View
      style={{ gap: 12, paddingVertical: 12 }}
      accessibilityLiveRegion="polite"
    >
      {loading && <ActivityIndicator color="#245bce" />}
      <ThemedText>{message}</ThemedText>
      {onRetry && <ActionButton label="Tentar novamente" onPress={onRetry} />}
    </View>
  );
}
