import { Linking } from 'react-native';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ActionButton } from '@/components/ActionButton';
export default function About() {
  return <Screen title="Sobre o fipeCheck"><ThemedText>Projeto da disciplina de Desenvolvimento em Dispositivos Móveis — UniAcademia.</ThemedText>
    <ThemedText>Lucas Cintra e Igor Salles Mari</ThemedText>
    <ThemedText>Dados FIPE e taxas: BrasilAPI. Os resultados são estimativas conforme os valores e referências apresentados.</ThemedText>
    <ActionButton label="Documentação da BrasilAPI" onPress={() => { void Linking.openURL('https://brasilapi.com.br/docs'); }} />
  </Screen>;
}
