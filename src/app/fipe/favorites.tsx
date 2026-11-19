import { router } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { VehicleCard } from "@/components/VehicleCard";
import { ActionButton } from "@/components/ActionButton";
import { Feedback } from "@/components/Feedback";
import { ThemedText } from "@/components/ThemedText";
import { useFavorites } from "@/context/FavoritesContext";
import { space, usePalette } from "@/constants/theme";

export default function Favorites() {
  const { favorites, ready, busy, error, retry, remove } = useFavorites();
  const c = usePalette();
  const cars = favorites.filter((item) => item.query.type === "carros").length;
  const sorted = [...favorites].sort((a, b) =>
    b.savedAt.localeCompare(a.savedAt),
  );
  return (
    <Screen
      title="Favoritos"
      subtitle={
        ready && favorites.length
          ? `${favorites.length} ${favorites.length === 1 ? "veículo salvo" : "veículos salvos"} · disponível offline`
          : undefined
      }
      tabs
      scroll={false}
    >
      {error && <Feedback message={error} onRetry={retry} />}
      {!ready && !error && <Feedback loading message="Lendo favoritos..." />}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        style={{ flex: 1, marginHorizontal: -space.xl }}
        contentContainerStyle={{
          gap: space.lg,
          paddingHorizontal: space.xl,
          paddingBottom: space.lg,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          ready ? (
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: c.mint100 }]}>
                <Ionicons name="star-outline" size={32} color={c.primary} />
              </View>
              <ThemedText variant="h2" style={{ textAlign: "center" }}>
                Nenhum favorito ainda
              </ThemedText>
              <ThemedText tone="muted" style={{ textAlign: "center" }}>
                Consulte um veículo e toque em “Salvar nos favoritos” para
                acessá-lo aqui, mesmo sem internet.
              </ThemedText>
              <ActionButton
                icon="search"
                label="Fazer uma consulta"
                onPress={() => router.navigate("/fipe")}
              />
            </View>
          ) : undefined
        }
        renderItem={({ item }) => (
          <VehicleCard
            details={item.details}
            type={item.query.type}
            footnote={`Salvo em ${new Date(item.savedAt).toLocaleDateString("pt-BR")} · consulta de ${item.details.dataConsulta}`}
          >
            <ActionButton
              compact
              variant="danger"
              icon="trash-outline"
              disabled={busy}
              label="Remover"
              accessibilityHint={`Remove ${item.details.modelo} dos favoritos`}
              onPress={() => {
                void remove(item.id);
              }}
            />
          </VehicleCard>
        )}
      />
      {ready && favorites.length > 0 && (
        <ActionButton
          icon="git-compare"
          label={cars >= 2 ? "Comparar carros" : "Salve 2 carros para comparar"}
          disabled={cars < 2}
          onPress={() => router.navigate("/fipe/compare")}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
