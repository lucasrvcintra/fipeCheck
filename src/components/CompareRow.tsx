import { View, StyleSheet } from "react-native";
import { useTheme } from "expo-router/react-navigation";
import { ThemedText } from "./ThemedText";
export function CompareRow({
  label,
  a,
  b,
}: {
  label: string;
  a: string;
  b: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { borderColor: colors.border }]}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View style={styles.values}>
        <ThemedText style={styles.cell}>A: {a}</ThemedText>
        <ThemedText style={styles.cell}>B: {b}</ThemedText>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { gap: 8, borderBottomWidth: 1, paddingVertical: 12 },
  label: { fontWeight: "600" },
  values: { flexDirection: "row", gap: 14 },
  cell: { flex: 1, flexWrap: "wrap" },
});
