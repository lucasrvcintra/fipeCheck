import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { VehicleDetails } from "@/types/fipe";
import { ThemedText } from "./ThemedText";
import { Card } from "./Card";
import type { ReactNode } from "react";
import { radius, space, usePalette } from "@/constants/theme";

export function VehicleCard({
  details,
  children,
  footnote,
  type,
}: {
  details: VehicleDetails;
  children?: ReactNode;
  footnote?: string;
  type?: "carros" | "motos" | "caminhoes";
}) {
  const c = usePalette();
  const icon =
    type === "motos" ? "bicycle" : type === "caminhoes" ? "bus" : "car-sport";
  return (
    <Card>
      <View style={styles.head}>
        <View style={[styles.icon, { backgroundColor: c.mint100 }]}>
          <Ionicons name={icon} size={20} color={c.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText variant="eyebrow" tone="muted">
            {details.marca}
          </ThemedText>
          <ThemedText variant="h3">{details.modelo}</ThemedText>
        </View>
      </View>
      <View style={styles.tags}>
        <Tag
          text={
            details.anoModelo === 32000 ? "Zero km" : String(details.anoModelo)
          }
        />
        <Tag text={details.combustivel} />
        <Tag text={`FIPE ${details.codigoFipe}`} />
      </View>
      <View style={[styles.price, { backgroundColor: c.mint50 }]}>
        <ThemedText variant="eyebrow" tone="muted">
          Preço FIPE · {details.mesReferencia.trim()}
        </ThemedText>
        <ThemedText variant="number" tone="primary">
          {details.valor}
        </ThemedText>
      </View>
      <ThemedText variant="caption" tone="muted">
        {footnote ?? `Consultado em ${details.dataConsulta}`}
      </ThemedText>
      {children}
    </Card>
  );
}

function Tag({ text }: { text: string }) {
  const c = usePalette();
  return (
    <View style={[styles.tag, { borderColor: c.hairlineStrong }]}>
      <ThemedText variant="caption" tone="body">
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: space.md },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: space.xs + 2 },
  tag: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: space.sm + 2,
    paddingVertical: 3,
  },
  price: { borderRadius: radius.card, padding: space.md, gap: 2 },
});
