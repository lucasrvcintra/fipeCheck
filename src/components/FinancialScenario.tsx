import { useState } from "react";
import { Linking, View } from "react-native";
import { RateReference } from "./RateReference";
import { MG_IPVA } from "@/data/ipva";
import {
  estimatedIpva,
  nonNegative,
  money,
  financing,
} from "@/utils/calculations";
import { OptionPicker } from "./OptionPicker";
import { NumberField } from "./NumberField";
import { CompareRow } from "./CompareRow";
import { Feedback } from "./Feedback";
import { ActionButton } from "./ActionButton";
import { RunningCostForm } from "./RunningCostForm";
import { ThemedText } from "./ThemedText";
export function FinancialScenario({
  priceA,
  priceB,
}: {
  priceA: number;
  priceB: number;
}) {
  const [finance, setFinance] = useState({
    downA: "",
    downB: "",
    rate: "",
    months: "",
  });
  const [simulate, setSimulate] = useState(false);
  const [enabled, setEnabled] = useState(false);
  let loan:
    | { a: ReturnType<typeof financing>; b: ReturnType<typeof financing> }
    | undefined;
  let loanError: string | undefined;
  if (enabled && simulate) {
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
    taxError = (error as Error).message;
  }
  return (
    <View style={{ gap: 16 }}>
      <ThemedText style={{ fontSize: 22, fontWeight: "700" }}>
        Financiamento
      </ThemedText>
      <ActionButton
        label={
          enabled ? "Usar cenário de compra à vista" : "Simular financiamento"
        }
        onPress={() => setEnabled((value) => !value)}
      />
      {enabled && (
        <>
          <RateReference />
          <ThemedText>
            Informe a taxa efetiva anual oferecida. Simulação sem IOF, tarifas
            ou outros encargos; não representa o CET de uma proposta.
          </ThemedText>
          {(Object.keys(finance) as (keyof typeof finance)[]).map((key) => (
            <NumberField
              key={key}
              label={FINANCE_LABELS[key]}
              value={finance[key]}
              onChange={(value) => setFinance((s) => ({ ...s, [key]: value }))}
            />
          ))}
          <ActionButton
            label="Calcular financiamento"
            onPress={() => setSimulate(true)}
          />
          {loanError && <Feedback message={loanError} />}
          {loan && (
            <>
              <CompareRow
                label="Valor financiado"
                a={money(loan.a.principal)}
                b={money(loan.b.principal)}
              />
              <CompareRow
                label="Parcela mensal"
                a={money(loan.a.installment)}
                b={money(loan.b.installment)}
              />
              <CompareRow
                label="Juros totais"
                a={money(loan.a.interest)}
                b={money(loan.b.interest)}
              />
              <CompareRow
                label="Entrada + parcelas"
                a={money(loan.a.total)}
                b={money(loan.b.total)}
              />
            </>
          )}
        </>
      )}
      <ThemedText style={{ fontSize: 22, fontWeight: "700" }}>
        IPVA estimado
      </ThemedText>
      <OptionPicker
        label="UF / cenário tributário"
        value={region}
        options={[
          { label: "MG — automóvel particular", value: "MG" },
          { label: "Outra UF — alíquota manual", value: "manual" },
        ]}
        onSelect={(option) => {
          setRegion(option.value);
          setTax(option.value === "MG" ? String(MG_IPVA.percent) : "");
        }}
      />
      <NumberField
        label="Alíquota anual de IPVA (%)"
        value={tax}
        onChange={setTax}
      />
      <ThemedText>
        {region === "MG" && tax === String(MG_IPVA.percent)
          ? `Regra geral MG, exercício ${MG_IPVA.year}: ${MG_IPVA.percent}%.`
          : "Alíquota informada pelo usuário."}{" "}
        Estimativa sobre a FIPE salva, sem isenções, descontos ou
        proporcionalidade. A base oficial da Sefaz pode ser diferente.
      </ThemedText>
      <ActionButton
        label="Fonte oficial de MG"
        onPress={() => {
          void Linking.openURL(MG_IPVA.source);
        }}
      />
      {taxError && <Feedback message={taxError} />}
      {annualA !== undefined && annualB !== undefined && (
        <>
          <CompareRow
            label="IPVA anual estimado"
            a={money(annualA)}
            b={money(annualB)}
          />
          <CompareRow
            label="Provisão mensal de IPVA"
            a={money(annualA / 12)}
            b={money(annualB / 12)}
          />
        </>
      )}
      <RunningCostForm
        annualTaxA={annualA ?? 0}
        annualTaxB={annualB ?? 0}
        installmentA={loan?.a.installment}
        installmentB={loan?.b.installment}
        blocked={
          taxError ??
          (enabled && !loan
            ? "Conclua uma simulação válida ou escolha compra à vista para incluir a parcela correta."
            : undefined)
        }
      />
    </View>
  );
}

const FINANCE_LABELS = {
  downA: "Entrada A (R$)",
  downB: "Entrada B (R$)",
  rate: "Taxa efetiva anual (%)",
  months: "Prazo (meses inteiros)",
};
