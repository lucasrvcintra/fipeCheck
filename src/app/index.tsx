import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { useFavorites } from "@/context/FavoritesContext";
import { fonts, radius, space, usePalette } from "@/constants/theme";

type IconName = keyof typeof Ionicons.glyphMap;

export default function Home() {
  const c = usePalette();
  const { favorites, ready } = useFavorites();
  const cars = favorites.filter((item) => item.query.type === "carros").length;
  return (
    <Screen>
      <View style={[styles.hero, { backgroundColor: c.forest }]}>
        <View style={[styles.pill, { backgroundColor: c.lime }]}>
          <ThemedText variant="eyebrow" style={{ color: "#00482f" }}>
            Tabela FIPE + simulações
          </ThemedText>
        </View>
        <ThemedText variant="display" style={{ color: "#ffffff" }}>
          Qual carro cabe no seu dia a dia?
        </ThemedText>
        <ThemedText style={{ color: "#ffffff", opacity: 0.85 }}>
          Consulte o preço FIPE, salve favoritos e compare compra,
          financiamento, IPVA e custo de uso.
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/fipe")}
          style={({ pressed }) => [
            styles.heroButton,
            { backgroundColor: pressed ? "#e8fdac" : c.lime },
          ]}
        >
          <Ionicons name="search" size={18} color="#00482f" />
          <ThemedText style={styles.heroLabel}>Consultar preço</ThemedText>
        </Pressable>
      </View>

      <View style={{ gap: space.md }}>
        <ThemedText variant="eyebrow" tone="muted">
          Atalhos
        </ThemedText>
        <Tile
          icon="star"
          title="Meus favoritos"
          text={
            ready && favorites.length
              ? `${favorites.length} salvo${favorites.length > 1 ? "s" : ""} · acesso offline`
              : "Veículos salvos ficam disponíveis offline"
          }
          href="/fipe/favorites"
        />
        <Tile
          icon="git-compare"
          title="Comparar carros"
          text={
            cars >= 2
              ? `${cars} carros prontos para comparar`
              : "Salve dois carros para comparar custos"
          }
          href="/fipe/compare"
        />
      </View>

      <View style={[styles.steps, { backgroundColor: c.mint50 }]}>
        <ThemedText variant="h3">Como funciona</ThemedText>
        {[
          "Escolha tipo, ano, marca e modelo e veja o preço FIPE.",
          "Salve nos favoritos os carros que te interessam.",
          "Compare dois carros e ajuste o cenário: entrada, taxa, IPVA, consumo.",
        ].map((text, index) => (
          <View key={index} style={styles.step}>
            <View style={[styles.number, { backgroundColor: c.primary }]}>
              <ThemedText
                variant="caption"
                style={{ color: c.onPrimary, fontFamily: fonts.bold }}
              >
                {index + 1}
              </ThemedText>
            </View>
            <ThemedText variant="bodySm" style={{ flex: 1 }}>
              {text}
            </ThemedText>
          </View>
        ))}
      </View>
    </Screen>
  );
}

function Tile({
  icon,
  title,
  text,
  href,
}: {
  icon: IconName;
  title: string;
  text: string;
  href: Href;
}) {
  const c = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${text}`}
      onPress={() => router.push(href)}
      style={({ pressed }) => [
        styles.tile,
        {
          borderColor: c.hairlineStrong,
          backgroundColor: pressed ? c.mint50 : c.canvas,
        },
      ]}
    >
      <View style={[styles.tileIcon, { backgroundColor: c.mint100 }]}>
        <Ionicons name={icon} size={20} color={c.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <ThemedText variant="h3">{title}</ThemedText>
        <ThemedText variant="bodySm" tone="muted">
          {text}
        </ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={c.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.panel, padding: space.xxl, gap: space.lg },
  pill: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    borderRadius: radius.control,
    minHeight: 50,
    marginTop: space.xs,
  },
  heroLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: "#00482f",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    borderWidth: 1,
    borderRadius: radius.tile,
    padding: space.lg,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  steps: { borderRadius: radius.panel, padding: space.xl, gap: space.md },
  step: { flexDirection: "row", gap: space.md, alignItems: "flex-start" },
  number: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
