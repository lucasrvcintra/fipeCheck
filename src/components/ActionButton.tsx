import { Pressable, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
export function ActionButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, (disabled || pressed) && styles.dim]}><ThemedText style={styles.label}>{label}</ThemedText></Pressable>;
}
const styles = StyleSheet.create({ button: { backgroundColor: '#245bce', borderRadius: 10, padding: 14, alignItems: 'center', minHeight: 48 }, label: { color: '#fff', fontWeight: '600', textAlign: 'center' }, dim: { opacity: 0.5 } });
