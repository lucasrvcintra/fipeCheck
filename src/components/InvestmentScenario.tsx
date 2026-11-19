import { useState } from "react";
import type { RatesResource } from "@/hooks/useRates";
import type { Benchmark } from "@/utils/rates";
import { investmentGrowth, money, nonNegative } from "@/utils/calculations";
import { Section } from "./Section";
import { Segmented } from "./OptionPicker";
import { NumberField } from "./NumberField";
import { CompareRow, CompareTable } from "./CompareRow";
import { RateReference } from "./RateReference";
import { ThemedText } from "./ThemedText";
import { Feedback } from "./Feedback";

export function InvestmentScenario({
  priceA,
  priceB,
  nameA,
  nameB,
  rates,
}: {
  priceA: number;
  priceB: number;
  nameA: string;
  nameB: string;
  rates: RatesResource;
}) {
  const [benchmark, setBenchmark] = useState<Benchmark>("Selic");
  const [months, setMonths] = useState("12");
  const annualRate = rates.data?.values[benchmark];
  let result:
    | {
        a: ReturnType<typeof investmentGrowth>;
        b: ReturnType<typeof investmentGrowth>;
      }
    | undefined;
  let error: string | undefined;
  if (annualRate !== undefined && months.trim()) {
    try {
      const duration = nonNegative(months, "Prazo");
      result = {
        a: investmentGrowth(priceA, annualRate, duration),
        b: investmentGrowth(priceB, annualRate, duration),
      };
    } catch (err) {
      error = (err as Error).message;
    }
  }
  return (
    <Section
      step="Passo 5"
      title="E se eu aplicasse esse dinheiro?"
      description="Simule aplicar à vista o valor FIPE de cada carro, em vez de gastá-lo na compra."
    >
      <RateReference rates={rates} />
      <Segmented
        label="Taxa anual de referência"
        value={benchmark}
        options={[
          { value: "Selic", label: "SELIC" },
          { value: "CDI", label: "CDI" },
        ]}
        onSelect={(option) => setBenchmark(option.value as Benchmark)}
      />
      <NumberField
        label="Prazo da aplicação"
        suffix="meses"
        integer
        value={months}
        onChange={setMonths}
        hint="Prazo independente do financiamento, em meses inteiros."
      />
      <ThemedText variant="bodySm" tone="muted">
        Projeção bruta com juros compostos: usa a taxa anual escolhida,
        constante durante todo o prazo. Sem impostos, tarifas, inflação, aportes
        ou retiradas. Não é previsão nem rendimento garantido de um produto
        financeiro.
      </ThemedText>
      {!months.trim() && (
        <ThemedText variant="bodySm" tone="muted">
          Informe o prazo para projetar o rendimento.
        </ThemedText>
      )}
      {error && <Feedback tone="error" message={error} />}
      {result && (
        <>
          <ThemedText variant="bodySm">
            Taxa usada no cálculo: {annualRate!.toLocaleString("pt-BR")}% a.a. (
            {benchmark.toUpperCase()}).
          </ThemedText>
          <CompareTable nameA={nameA} nameB={nameB}>
            <CompareRow
              label="Capital inicial (FIPE)"
              a={money(result.a.principal)}
              b={money(result.b.principal)}
            />
            <CompareRow
              label="Rendimento bruto no período"
              a={money(result.a.grossYield)}
              b={money(result.b.grossYield)}
              strong
            />
            <CompareRow
              label="Saldo final bruto"
              a={money(result.a.total)}
              b={money(result.b.total)}
            />
          </CompareTable>
          <ThemedText variant="bodySm" tone="muted">
            Os valores representam cenários separados: não comprar cada carro e
            manter seu preço aplicado. A projeção não soma parcelas nem compara
            mobilidade ou o valor futuro do veículo.
          </ThemedText>
        </>
      )}
    </Section>
  );
}
