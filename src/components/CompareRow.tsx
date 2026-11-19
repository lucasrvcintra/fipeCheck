import { View, StyleSheet } from "react-native";
import type { ReactNode } from "react";
import { ThemedText } from "./ThemedText";
import { fonts, radius, space, usePalette } from "@/constants/theme";

/** Tabela A × B com cabeçalho fixo e linhas separadas por hairlines. */
export function CompareTable({
  nameA,
  nameB,
  children,
}: {
  nameA?: string;
  nameB?: string;
  children: ReactNode;
}) {
  const c = usePalette();
  return (
    <View style={[styles.table, { borderColor: c.hairlineStrong }]}>
      <View style={[styles.header, { backgroundColor: c.canvasSoft }]}>
        <Badge letter="A" />
        <ThemedText variant="caption" numberOfLines={1} style={styles.headName}>
          {nameA ?? "Carro A"}
        </ThemedText>
        <Badge letter="B" />
        <ThemedText variant="caption" numberOfLines={1} style={styles.headName}>
          {nameB ?? "Carro B"}
        </ThemedText>
      </View>
      {children}
    </View>
  );
}

export function Badge({ letter }: { letter: "A" | "B" }) {
  const c = usePalette();
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: letter === "A" ? c.forest : c.primary },
      ]}
    >
      <ThemedText
        variant="caption"
        style={{
          color: letter === "A" ? c.onForest : c.onPrimary,
          fontFamily: fonts.bold,
        }}
      >
        {letter}
      </ThemedText>
    </View>
  );
}

/**
 * Linha da comparação. Quando `compare` recebe os dois números, o menor valor
 * (mais vantajoso) é destacado em verde.
 */
export function CompareRow({
  label,
  a,
  b,
  compare,
  strong = false,
}: {
  label: string;
  a: string;
  b: string;
  compare?: [number | null, number | null];
  strong?: boolean;
}) {
  const c = usePalette();
  let best: "a" | "b" | null = null;
  if (
    compare &&
    compare[0] !== null &&
    compare[1] !== null &&
    compare[0] !== compare[1]
  )
    best = compare[0] < compare[1] ? "a" : "b";
  const cell = (side: "a" | "b", text: string) => (
    <View style={styles.cell}>
      <ThemedText
        style={[
          strong ? styles.strong : styles.value,
          { color: best === side ? c.better : c.ink },
        ]}
      >
        {text}
      </ThemedText>
      {best === side && (
        <ThemedText variant="caption" style={{ color: c.better }}>
          ▼ menor
        </ThemedText>
      )}
    </View>
  );
  return (
    <View
      style={[styles.row, { borderTopColor: c.hairline }]}
      accessible
      accessibilityLabel={`${label}. A: ${a}. B: ${b}.${best ? ` Menor valor: ${best.toUpperCase()}.` : ""}`}
    >
      <ThemedText variant="caption" tone="muted">
        {label}
      </ThemedText>
      <View style={styles.values}>
        {cell("a", a)}
        {cell("b", b)}
      </View>
    </View>
  );
}

/** Bloco de destaque com fundo verde escuro para o resultado principal. */
export function StatBlock({
  eyebrow,
  value,
  caption,
}: {
  eyebrow: string;
  value: string;
  caption?: string;
}) {
  const c = usePalette();
  return (
    <View
      style={[styles.stat, { backgroundColor: c.forest }]}
      accessible
      accessibilityLabel={`${eyebrow}: ${value}. ${caption ?? ""}`}
    >
      <ThemedText variant="eyebrow" style={{ color: c.lime }}>
        {eyebrow}
      </ThemedText>
      <ThemedText variant="number" style={{ color: c.onForest }}>
        {value}
      </ThemedText>
      {caption && (
        <ThemedText
          variant="bodySm"
          style={{ color: c.onForest, opacity: 0.85 }}
        >
          {caption}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  table: { borderWidth: 1, borderRadius: radius.card, overflow: "hidden" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  headName: { flex: 1, fontFamily: fonts.semibold },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    gap: space.xs,
    borderTopWidth: 1,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
  },
  values: { flexDirection: "row", gap: space.md },
  cell: { flex: 1, minWidth: 0 },
  value: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 },
  strong: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24 },
  stat: { borderRadius: radius.card, padding: space.xl, gap: space.xs },
});
