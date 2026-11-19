import { router } from "expo-router";
import { FlatList, View } from "react-native";
import { Screen } from "@/components/Screen";
import { VehicleCard } from "@/components/VehicleCard";
import { ActionButton } from "@/components/ActionButton";
import { Feedback } from "@/components/Feedback";
import { ThemedText } from "@/components/ThemedText";
import { useFavorites } from "@/context/FavoritesContext";
export default function Favorites() {
  const { favorites, ready, busy, error, retry, remove } = useFavorites();
  return (
    <Screen title="Favoritos" tabs scroll={false}>
      {error && <Feedback message={error} onRetry={retry} />}
      {!ready && !error && <Feedback loading message="Lendo favoritos..." />}
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListEmptyComponent={
          ready ? (
            <Feedback message="Nenhum favorito. Consulte um veículo e salve seu resultado." />
          ) : undefined
        }
        renderItem={({ item }) => (
          <VehicleCard details={item.details}>
            <ThemedText>
              Resultado salvo — pode ser consultado offline.
            </ThemedText>
            <ActionButton
              disabled={busy}
              label="Remover favorito"
              onPress={() => {
                void remove(item.id);
              }}
            />
          </VehicleCard>
        )}
      />
      <ActionButton
        label="Comparar carros"
        onPress={() => router.navigate("./compare")}
      />
    </Screen>
  );
}
