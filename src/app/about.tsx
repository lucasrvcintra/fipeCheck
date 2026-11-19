import { Linking, View } from "react-native";
import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { ActionButton } from "@/components/ActionButton";
import { Card } from "@/components/Card";
import { Feedback } from "@/components/Feedback";
import { space } from "@/constants/theme";

export default function About() {
  return (
    <Screen
      title="Sobre o fipeCheck"
      subtitle="Projeto da disciplina de Desenvolvimento em Dispositivos Móveis — UniAcademia."
    >
      <Card>
        <ThemedText variant="eyebrow" tone="muted">
          Integrantes
        </ThemedText>
        <View style={{ gap: space.xs }}>
          <ThemedText variant="h3">Lucas Cintra</ThemedText>
          <ThemedText variant="h3">Igor Salles Mari</ThemedText>
        </View>
      </Card>
      <Card>
        <ThemedText variant="eyebrow" tone="muted">
          Fonte dos dados
        </ThemedText>
        <ThemedText>
          Preços FIPE e taxas SELIC/CDI vêm da BrasilAPI, sem necessidade de
          cadastro.
        </ThemedText>
        <ActionButton
          variant="outline"
          icon="open-outline"
          label="Documentação da BrasilAPI"
          onPress={() => {
            void Linking.openURL("https://brasilapi.com.br/docs");
          }}
        />
      </Card>
      <Feedback
        tone="tip"
        title="Estimativas"
        message="Os resultados dependem dos valores e referências apresentados. Não substituem propostas de crédito nem cálculos oficiais de tributos."
      />
    </Screen>
  );
}
