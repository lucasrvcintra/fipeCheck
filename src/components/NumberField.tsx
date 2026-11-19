import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from 'expo-router/react-navigation';
import { ThemedText } from './ThemedText';
export function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const { colors } = useTheme();
  return <View style={styles.field}><ThemedText>{label}</ThemedText><TextInput accessibilityLabel={label} keyboardType="decimal-pad" value={value} onChangeText={onChange} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]} /></View>;
}
const styles = StyleSheet.create({ field: { gap: 6 }, input: { padding: 12, minHeight: 48, borderWidth: 1, borderRadius: 8, fontSize: 16 } });
