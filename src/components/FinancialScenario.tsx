import { useState } from "react";
import { Linking, Switch, View } from "react-native";
import { RateReference } from "./RateReference";
import { InvestmentScenario } from "./InvestmentScenario";
import { useRates } from "@/hooks/useRates";
import { MG_IPVA } from "@/data/ipva";
import {
  estimatedIpva,
  nonNegative,
  money,
  financing,
} from "@/utils/calculations";
import { Segmented } from "./OptionPicker";
import { NumberField, FieldPair } from "./NumberField";
import { CompareRow, CompareTable } from "./CompareRow";
import { Feedback } from "./Feedback";
import { ActionButton } from "./ActionButton";
import { RunningCostForm } from "./RunningCostForm";
import { ThemedText } from "./ThemedText";
import { Section } from "./Section";
import { Card } from "./Card";
import { usePalette } from "@/constants/theme";

export function FinancialScenario({
  priceA,
  priceB,
  nameA,
  nameB,
}: {
  priceA: number;
  priceB: number;
  nameA: string;
  nameB: string;
}) {
  const c = usePalette();
  const rates = useRates();
  const [finance, setFinance] = useState({
    downA: "0",
    downB: "0",
    rate: "",
    months: "",
  });
  const [enabled, setEnabled] = useState(false);
  const set = (key: keyof typeof finance) => (value: string) =>
    setFinance((s) => ({ ...s, [key]: value }));

  // O cálculo é automático assim que todos os campos estão preenchidos.
  const complete = Object.values(finance).every((value) => value.trim() !== "");
  let loan:
    | { a: ReturnType<typeof financing>; b: ReturnType<typeof financing> }
    | undefined;
  let loanError: string | undefined;
  if (enabled && complete) {
    try {
      const rate = nonNegative(finance.rate, "Taxa anual");
      const months = nonNegative(finance.months, "Prazo");
      loan = {
        a: financing(
          priceA,
          nonNegative(finance.downA, "Entrada A"),
          rate,
          months,
        ),
        b: financing(
          priceB,
          nonNegative(finance.downB, "Entrada B"),
          rate,
          months,
        ),
      };
    } catch (error) {
      loanError = (error as Error).message;
    }
  }

  const [region, setRegion] = useState("MG");
  const [tax, setTax] = useState(String(MG_IPVA.percent));
  let annualA: number | undefined,
    annualB: number | undefined,
    taxError: string | undefined;
  try {
    const percent = nonNegative(tax, "Alíquota");
    annualA = estimatedIpva(priceA, percent);
    annualB = estimatedIpva(priceB, percent);
  } catch (error) {
    taxError = tax.trim()
      ? (error as Error).message
      : "Informe a alíquota de IPVA.";
  }

  return (
    <>
      <Section
        step="Passo 2"
        title="Financiamento"
        description={
          enabled
            ? "Informe a taxa efetiva anual oferecida. Sem IOF, tarifas ou outros encargos; não representa o CET."
            : "Desativado: considerando compra à vista."
        }
        right={
          <Switch
            accessibilityLabel="Simular financiamento"
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ true: c.primary, false: c.hairlineStrong }}
            thumbColor={c.canvas}
            ios_backgroundColor={c.hairlineStrong}
          />
        }
      >
        {enabled && (
          <>
            <RateReference rates={rates} />
            <FieldPair>
              <NumberField
                label="Taxa anual"
                suffix="% a.a."
                placeholder="ex. 24"
                value={finance.rate}
                onChange={set("rate")}
              />
              <NumberField
                label="Prazo"
                suffix="meses"
                placeholder="ex. 48"
                integer
                value={finance.months}
                onChange={set("months")}
              />
            </FieldPair>
            <FieldPair>
              <NumberField
                label="Entrada A"
                prefix="R$"
                value={finance.downA}
                onChange={set("downA")}
              />
              <NumberField
                label="Entrada B"
                prefix="R$"
                value={finance.downB}
                onChange={set("downB")}
              />
            </FieldPair>
            {!complete && (
              <ThemedText variant="bodySm" tone="muted">
                Preencha taxa, prazo e entradas para ver as parcelas.
              </ThemedText>
            )}
            {loanError && <Feedback tone="error" message={loanError} />}
            {loan && (
              <CompareTable nameA={nameA} nameB={nameB}>
                <CompareRow
                  label="Parcela mensal"
                  a={money(loan.a.installment)}
                  b={money(loan.b.installment)}
                  compare={[loan.a.installment, loan.b.installment]}
                  strong
                />
                <CompareRow
                  label="Valor financiado"
                  a={money(loan.a.principal)}
                  b={money(loan.b.principal)}
                />
                <CompareRow
                  label="Juros totais"
                  a={money(loan.a.interest)}
                  b={money(loan.b.interest)}
                  compare={[loan.a.interest, loan.b.interest]}
                />
                <CompareRow
                  label="Entrada + parcelas"
                  a={money(loan.a.total)}
                  b={money(loan.b.total)}
                  compare={[loan.a.total, loan.b.total]}
                />
              </CompareTable>
            )}
          </>
        )}
      </Section>

      <Section
        step="Passo 3"
        title="IPVA estimado"
        description="Estimativa sobre a FIPE salva, sem isenções, descontos ou proporcionalidade. A base oficial da Sefaz pode ser diferente."
      >
        <Segmented
          label="Cenário tributário"
          value={region}
          options={[
            { label: "MG · particular", value: "MG" },
            { label: "Outra UF", value: "manual" },
          ]}
          onSelect={(option) => {
            setRegion(option.value);
            setTax(option.value === "MG" ? String(MG_IPVA.percent) : "");
          }}
        />
        <NumberField
          label="Alíquota anual"
          suffix="%"
          placeholder="ex. 3,5"
          value={tax}
          onChange={setTax}
          hint={
            region === "MG" && tax === String(MG_IPVA.percent)
              ? `Regra geral de MG, exercício ${MG_IPVA.year}.`
              : "Alíquota informada por você."
          }
        />
        {taxError && <Feedback tone="error" message={taxError} />}
        {annualA !== undefined && annualB !== undefined && (
          <CompareTable nameA={nameA} nameB={nameB}>
            <CompareRow
              label="IPVA por ano"
              a={money(annualA)}
              b={money(annualB)}
              compare={[annualA, annualB]}
              strong
            />
            <CompareRow
              label="Provisão mensal"
              a={money(annualA / 12)}
              b={money(annualB / 12)}
            />
          </CompareTable>
        )}
        {region === "MG" && (
          <View style={{ alignSelf: "flex-start" }}>
            <ActionButton
              compact
              variant="ghost"
              icon="open-outline"
              label="Fonte oficial (SEF/MG)"
              onPress={() => {
                void Linking.openURL(MG_IPVA.source);
              }}
            />
          </View>
        )}
      </Section>

      <RunningCostForm
        nameA={nameA}
        nameB={nameB}
        annualTaxA={annualA ?? 0}
        annualTaxB={annualB ?? 0}
        installmentA={loan?.a.installment}
        installmentB={loan?.b.installment}
        blocked={
          taxError
            ? "Corrija a alíquota de IPVA para calcular o custo de uso."
            : enabled && !loan
              ? "Conclua o financiamento (passo 2) ou desative-o para calcular o custo mensal total."
              : undefined
        }
      />
      <InvestmentScenario
        priceA={priceA}
        priceB={priceB}
        nameA={nameA}
        nameB={nameB}
        rates={rates}
      />
      <Card tone="soft">
        <ThemedText variant="caption" tone="muted">
          Valores estimados a partir dos preços FIPE salvos e das premissas
          informadas. Não constituem proposta de crédito nem cálculo oficial de
          tributos.
        </ThemedText>
      </Card>
    </>
  );
}
