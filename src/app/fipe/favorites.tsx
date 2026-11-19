import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { VehicleCard } from '@/components/VehicleCard';
import { ActionButton } from '@/components/ActionButton';
import { Feedback } from '@/components/Feedback';
import { ThemedText } from '@/components/ThemedText';
import { useFavorites } from '@/context/FavoritesContext';
export default function Favorites() {
  const { favorites, ready, busy, error, retry, remove } = useFavorites();
  return <Screen title="Favoritos">
    {error && <Feedback message={error} onRetry={retry} />}
    {!ready && !error && <Feedback loading message="Lendo favoritos..." />}
    {ready && !favorites.length && <Feedback message="Nenhum favorito. Consulte um veículo e salve seu resultado." />}
    {favorites.map(item => <VehicleCard key={item.id} details={item.details}><ThemedText>Resultado salvo — pode ser consultado offline.</ThemedText><ActionButton disabled={busy} label="Remover favorito" onPress={() => { void remove(item.id); }} /></VehicleCard>)}
    <ActionButton label="Comparar carros" onPress={() => router.navigate('./compare')} />
  </Screen>;
}
