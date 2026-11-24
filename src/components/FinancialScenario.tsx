import { useState } from "react";
import { Linking, Switch, View } from "react-native";
import { RateReference } from "./RateReference";
import { InvestmentScenario } from "./InvestmentScenario";
import { useRates } from "@/hooks/useRates";
import { MG_IPVA } from "@/data/ipva";
import { carIpva, nonNegative, money, financing } from "@/utils/calculations";
import { Segmented } from "./OptionPicker";
import { NumberField, FieldPair } from "./NumberField";
import { CompareRow, CompareTable } from "./CompareRow";
import { Feedback } from "./Feedback";
import { ActionButton } from "./ActionButton";
import { RunningCostForm } from "./RunningCostForm";
import { ThemedText } from "./ThemedText";
import { Section } from "./Section";
import { StepPanel } from "./Stepper";
import { Card } from "./Card";
import { usePalette } from "@/constants/theme";

export function FinancialScenario({
  idA,
  idB,
  priceA,
  priceB,
  modelYearA,
  modelYearB,
  nameA,
  nameB,
  step,
}: {
  step: number;
  idA: string;
  idB: string;
  priceA: number;
  priceB: number;
  modelYearA: number;
  modelYearB: number;
  nameA: string;
  nameB: string;
}) {
  const c = usePalette();
  const rates = useRates();
  const [finance, setFinance] = useState({
    rate: "",
    months: "",
  });
  // Entradas pertencem ao veículo, independentemente da coluna A/B.
  const [downPayments, setDownPayments] = useState<Record<string, string>>({});
  const downA = downPayments[idA] ?? "0";
  const downB = downPayments[idB] ?? "0";
  const [enabled, setEnabled] = useState(false);
  const set = (key: keyof typeof finance) => (value: string) =>
    setFinance((s) => ({ ...s, [key]: value }));

  // O cálculo é automático assim que todos os campos estão preenchidos.
  const complete = [downA, downB, ...Object.values(finance)].every(
    (value) => value.trim() !== "",
  );
  let loan:
    | { a: ReturnType<typeof financing>; b: ReturnType<typeof financing> }
    | undefined;
  let loanError: string | undefined;
  if (enabled && complete) {
    try {
      const rate = nonNegative(finance.rate, "Taxa anual");
      const months = nonNegative(finance.months, "Prazo");
      loan = {
        a: financing(priceA, nonNegative(downA, "Entrada A"), rate, months),
        b: financing(priceB, nonNegative(downB, "Entrada B"), rate, months),
      };
    } catch (error) {
      loanError = (error as Error).message;
    }
  }

  const [region, setRegion] = useState("MG");
  const [tax, setTax] = useState(String(MG_IPVA.percent));
  // A API traz ano-modelo, não fabricação. A estimativa pode ser corrigida por veículo.
  const [fabricationYears, setFabricationYears] = useState<
    Record<string, string>
  >({});
  const yearA =
    fabricationYears[idA] ??
    String(
      modelYearA === 32000 ? MG_IPVA.year : Math.min(modelYearA, MG_IPVA.year),
    );
  const yearB =
    fabricationYears[idB] ??
    String(
      modelYearB === 32000 ? MG_IPVA.year : Math.min(modelYearB, MG_IPVA.year),
    );
  let ipvaA: ReturnType<typeof carIpva> | undefined;
  let ipvaB: ReturnType<typeof carIpva> | undefined;
  let taxError: string | undefined;
  try {
    const percent = nonNegative(tax, "Alíquota");
    ipvaA = carIpva(
      priceA,
      percent,
      nonNegative(yearA, "Fabricação A"),
      MG_IPVA.year,
    );
    ipvaB = carIpva(
      priceB,
      percent,
      nonNegative(yearB, "Fabricação B"),
      MG_IPVA.year,
    );
  } catch (error) {
    taxError = (error as Error).message;
  }
  const annualA = ipvaA?.annual;
  const annualB = ipvaB?.annual;

  return (
    <>
      <StepPanel active={step === 1}>
        <Section
          step="Passo 2 de 5"
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
                  value={downA}
                  onChange={(value) =>
                    setDownPayments((previous) => ({
                      ...previous,
                      [idA]: value,
                    }))
                  }
                />
                <NumberField
                  label="Entrada B"
                  prefix="R$"
                  value={downB}
                  onChange={(value) =>
                    setDownPayments((previous) => ({
                      ...previous,
                      [idB]: value,
                    }))
                  }
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
      </StepPanel>

      <StepPanel active={step === 2}>
        <Section
          step="Passo 3 de 5"
          title="IPVA estimado"
          description={`Exercício ${MG_IPVA.year}. Estimativa sobre a FIPE salva, com imunidade por idade para automóveis de passageiros. Sem outras isenções, descontos ou proporcionalidade.`}
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
          <ThemedText variant="bodySm" tone="muted">
            A FIPE informa o ano-modelo. Usamos esse ano como estimativa inicial
            da fabricação; confirme no documento do veículo e ajuste abaixo.
            Para zero km ou modelo futuro, o valor inicial é o ano do exercício.
            A imunidade considera 20 anos ou mais de fabricação.
          </ThemedText>
          <FieldPair>
            <NumberField
              label="Fabricação A"
              integer
              value={yearA}
              onChange={(value) =>
                setFabricationYears((previous) => ({
                  ...previous,
                  [idA]: value,
                }))
              }
            />
            <NumberField
              label="Fabricação B"
              integer
              value={yearB}
              onChange={(value) =>
                setFabricationYears((previous) => ({
                  ...previous,
                  [idB]: value,
                }))
              }
            />
          </FieldPair>
          {taxError && <Feedback tone="error" message={taxError} />}
          {annualA !== undefined && annualB !== undefined && (
            <CompareTable nameA={nameA} nameB={nameB}>
              <CompareRow
                label="Situação por idade (estimada)"
                a={
                  ipvaA?.exemptByAge
                    ? `Imune: ${ipvaA.age} anos`
                    : "Sem imunidade por idade"
                }
                b={
                  ipvaB?.exemptByAge
                    ? `Imune: ${ipvaB.age} anos`
                    : "Sem imunidade por idade"
                }
              />
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
          <ActionButton
            compact
            variant="ghost"
            icon="open-outline"
            label="Regra dos 20 anos (EC 137/2025)"
            onPress={() => {
              void Linking.openURL(MG_IPVA.ageExemptionSource);
            }}
          />
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
      </StepPanel>

      <StepPanel active={step === 3}>
        <RunningCostForm
          idA={idA}
          idB={idB}
          nameA={nameA}
          nameB={nameB}
          annualTaxA={annualA ?? 0}
          annualTaxB={annualB ?? 0}
          installmentA={loan?.a.installment}
          installmentB={loan?.b.installment}
          blocked={
            taxError
              ? "Confira a alíquota e os anos de fabricação para calcular o custo de uso."
              : enabled && !loan
                ? "Conclua o financiamento (passo 2) ou desative-o para calcular o custo mensal total."
                : undefined
          }
        />
      </StepPanel>
      <StepPanel active={step === 4}>
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
            informadas. Não constituem proposta de crédito nem cálculo oficial
            de tributos.
          </ThemedText>
        </Card>
      </StepPanel>
    </>
  );
}
