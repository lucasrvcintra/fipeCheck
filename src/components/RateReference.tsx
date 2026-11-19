import type { RatesResource } from "@/hooks/useRates";
import { Feedback } from "./Feedback";

export function RateReference({ rates }: { rates: RatesResource }) {
  if (rates.loading)
    return <Feedback loading message="Consultando SELIC e CDI..." />;
  if (rates.error)
    return (
      <Feedback
        title="Taxas indisponíveis"
        message={`${rates.error} O financiamento manual continua disponível; a projeção de aplicação depende dessas taxas.`}
        onRetry={rates.retry}
      />
    );
  if (!rates.data) return null;
  const { values, receivedAt } = rates.data;
  return (
    <Feedback
      tone="info"
      title="Taxas obtidas da BrasilAPI"
      message={`SELIC ${values.Selic.toLocaleString("pt-BR")}% a.a. · CDI ${values.CDI.toLocaleString("pt-BR")}% a.a. Obtidas em ${receivedAt}; a API não informa a data-base. No financiamento, a taxa continua sendo informada por você.`}
    />
  );
}
