import { useState, type ReactNode } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { fonts, radius, space, usePalette } from "@/constants/theme";

export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
  hint,
  integer = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  hint?: string;
  integer?: boolean;
}) {
  const c = usePalette();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <ThemedText variant="label" numberOfLines={2}>
        {label}
      </ThemedText>
      <View
        style={[
          styles.box,
          {
            borderColor: focused ? c.primary : c.hairlineStrong,
            backgroundColor: c.canvas,
          },
          focused && styles.focused,
        ]}
      >
        {prefix && (
          <ThemedText variant="bodySm" tone="muted">
            {prefix}
          </ThemedText>
        )}
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={hint}
          keyboardType={integer ? "number-pad" : "decimal-pad"}
          inputMode={integer ? "numeric" : "decimal"}
          returnKeyType="done"
          value={value}
          placeholder={placeholder}
          placeholderTextColor={c.faint}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectTextOnFocus
          style={[styles.input, { color: c.ink }]}
        />
        {suffix && (
          <ThemedText variant="bodySm" tone="muted">
            {suffix}
          </ThemedText>
        )}
      </View>
      {hint && (
        <ThemedText variant="caption" tone="muted">
          {hint}
        </ThemedText>
      )}
    </View>
  );
}

/** Dois campos lado a lado (carro A e carro B). */
export function FieldPair({ children }: { children: ReactNode }) {
  return <View style={styles.pair}>{children}</View>;
}

const styles = StyleSheet.create({
  field: { gap: space.xs + 2, flex: 1, minWidth: 0 },
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingHorizontal: space.md,
    minHeight: 50,
  },
  focused: { borderWidth: 2, paddingHorizontal: space.md - 1 },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.semibold,
    fontSize: 16,
    paddingVertical: space.md,
  },
  pair: { flexDirection: "row", gap: space.md, alignItems: "flex-start" },
});
