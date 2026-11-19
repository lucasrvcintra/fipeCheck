import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ActionButton } from '@/components/ActionButton';
export default function Home() {
  return <Screen title="fipeCheck"><ThemedText>Qual carro faz mais sentido para o seu dia a dia? Consulte a FIPE, salve favoritos e simule compra e uso.</ThemedText>
    <ActionButton label="Consultar FIPE" onPress={() => router.push('./fipe')} />
    <ActionButton label="Meus favoritos" onPress={() => router.push('./fipe/favorites')} />
    <ActionButton label="Comparar carros" onPress={() => router.push('./fipe/compare')} />
  </Screen>;
}
