import { useState } from "react";
import { View } from "react-native";
import { NumberField, FieldPair } from "./NumberField";
import { ActionButton } from "./ActionButton";
import { Feedback } from "./Feedback";
import { CompareRow, CompareTable, StatBlock } from "./CompareRow";
import { ThemedText } from "./ThemedText";
import { Section } from "./Section";
import { useStoredState } from "@/hooks/useStoredState";
import { money, nonNegative, runningCosts } from "@/utils/calculations";
import { space } from "@/constants/theme";

const INITIAL = { km: "1000", fuelPrice: "6" };
function validPreferences(data: unknown): data is typeof INITIAL {
  if (
    !data ||
    typeof data !== "object" ||
    !("km" in data) ||
    !("fuelPrice" in data) ||
    typeof data.km !== "string" ||
    typeof data.fuelPrice !== "string"
  )
    return false;
  try {
    return (
      nonNegative(data.km, "Km") >= 0 &&
      nonNegative(data.fuelPrice, "Combustível") > 0
    );
  } catch {
    return false;
  }
}

export function RunningCostForm({
  nameA,
  nameB,
  annualTaxA = 0,
  annualTaxB = 0,
  installmentA = 0,
  installmentB = 0,
  blocked,
}: {
  nameA: string;
  nameB: string;
  blocked?: string;
  annualTaxA?: number;
  annualTaxB?: number;
  installmentA?: number;
  installmentB?: number;
}) {
  const preferences = useStoredState(
    "fipecheck_usage_v1",
    INITIAL,
    validPreferences,
  );
  const [shared, setShared] = useState<{ km?: string; fuelPrice?: string }>({});
  const [fields, setFields] = useState({
    consumptionA: "",
    consumptionB: "",
    maintenanceA: "0",
    maintenanceB: "0",
    insuranceA: "0",
    insuranceB: "0",
  });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const km = shared.km ?? preferences.value.km;
  const fuelPrice = shared.fuelPrice ?? preferences.value.fuelPrice;
  const set = (key: keyof typeof fields) => (value: string) =>
    setFields((s) => ({ ...s, [key]: value }));
  const setShare = (key: "km" | "fuelPrice") => (value: string) => {
    setShared((s) => ({ ...s, [key]: value }));
    setSaved(false);
    setSaveError(false);
  };

  function calculate() {
    const common = {
      km: nonNegative(km, "Quilometragem"),
      fuelPrice: nonNegative(fuelPrice, "Preço do litro"),
    };
    const a = runningCosts({
      ...common,
      consumption: nonNegative(fields.consumptionA, "Consumo A"),
      maintenance: nonNegative(fields.maintenanceA, "Manutenção A"),
      insurance: nonNegative(fields.insuranceA, "Seguro A"),
      annualTax: annualTaxA,
    });
    const b = runningCosts({
      ...common,
      consumption: nonNegative(fields.consumptionB, "Consumo B"),
      maintenance: nonNegative(fields.maintenanceB, "Manutenção B"),
      insurance: nonNegative(fields.insuranceB, "Seguro B"),
      annualTax: annualTaxB,
    });
    return { a, b };
  }

  // Calcula automaticamente quando todos os campos estão preenchidos.
  const complete = [km, fuelPrice, ...Object.values(fields)].every(
    (value) => value.trim() !== "",
  );
  let result: ReturnType<typeof calculate> | undefined,
    error: string | undefined;
  if (complete && !blocked) {
    try {
      result = calculate();
    } catch (err) {
      error = (err as Error).message;
    }
  }
  const totalA = result ? result.a.monthly + installmentA : 0;
  const totalB = result ? result.b.monthly + installmentB : 0;
  const financed = installmentA > 0 || installmentB > 0;

  return (
    <Section
      step="Passo 4"
      title="Custo de uso"
      description="Valores iniciais são exemplos editáveis. Use vírgula para decimais."
    >
      {!preferences.ready && !preferences.error && (
        <Feedback loading message="Lendo preferências..." />
      )}
      {preferences.error && (
        <Feedback message={preferences.error} onRetry={preferences.retry} />
      )}
      <ThemedText variant="eyebrow" tone="muted">
        Para os dois carros
      </ThemedText>
      <FieldPair>
        <NumberField
          label="Km por mês"
          suffix="km"
          value={km}
          onChange={setShare("km")}
        />
        <NumberField
          label="Preço do litro"
          prefix="R$"
          value={fuelPrice}
          onChange={setShare("fuelPrice")}
        />
      </FieldPair>
      <View style={{ alignSelf: "flex-start" }}>
        <ActionButton
          compact
          variant="ghost"
          icon={saved ? "checkmark-circle" : "bookmark-outline"}
          label={saved ? "Km e preço salvos" : "Lembrar km e preço do litro"}
          disabled={!preferences.ready || preferences.busy || saved}
          onPress={() => {
            if (!validPreferences({ km, fuelPrice })) {
              setSaveError(true);
              return;
            }
            void preferences.save({ km, fuelPrice }).then(setSaved);
          }}
        />
      </View>
      {saveError && (
        <Feedback
          tone="error"
          message="Km deve ser zero ou mais e o preço do litro maior que zero para salvar."
        />
      )}
      <ThemedText variant="eyebrow" tone="muted">
        Por carro
      </ThemedText>
      <FieldPair>
        <NumberField
          label="Consumo A"
          suffix="km/l"
          placeholder="ex. 12"
          value={fields.consumptionA}
          onChange={set("consumptionA")}
        />
        <NumberField
          label="Consumo B"
          suffix="km/l"
          placeholder="ex. 10"
          value={fields.consumptionB}
          onChange={set("consumptionB")}
        />
      </FieldPair>
      <FieldPair>
        <NumberField
          label="Manutenção A /mês"
          prefix="R$"
          value={fields.maintenanceA}
          onChange={set("maintenanceA")}
        />
        <NumberField
          label="Manutenção B /mês"
          prefix="R$"
          value={fields.maintenanceB}
          onChange={set("maintenanceB")}
        />
      </FieldPair>
      <FieldPair>
        <NumberField
          label="Seguro A /mês"
          prefix="R$"
          value={fields.insuranceA}
          onChange={set("insuranceA")}
        />
        <NumberField
          label="Seguro B /mês"
          prefix="R$"
          value={fields.insuranceB}
          onChange={set("insuranceB")}
        />
      </FieldPair>
      {blocked && <Feedback tone="tip" message={blocked} />}
      {!blocked && !complete && (
        <ThemedText variant="bodySm" tone="muted">
          Informe o consumo dos dois carros para ver o custo de uso.
        </ThemedText>
      )}
      {error && <Feedback tone="error" message={error} />}
      {result && (
        <View style={{ gap: space.lg }}>
          <StatBlock
            eyebrow={
              financed ? "Gasto mensal (uso + parcela)" : "Gasto mensal de uso"
            }
            value={
              totalA === totalB
                ? "Empate"
                : `${totalB > totalA ? "+" : "−"} ${money(Math.abs(totalB - totalA))}`
            }
            caption={
              totalA === totalB
                ? "Os dois carros custam o mesmo por mês neste cenário."
                : `O carro B custa ${money(Math.abs(totalB - totalA))} ${totalB > totalA ? "a mais" : "a menos"} por mês que o A (${money(Math.abs(totalB - totalA) * 12)} por ano).`
            }
          />
          <CompareTable nameA={nameA} nameB={nameB}>
            {financed && (
              <CompareRow
                label="Uso + parcela / mês"
                a={money(totalA)}
                b={money(totalB)}
                compare={[totalA, totalB]}
                strong
              />
            )}
            <CompareRow
              label="Uso / mês (sem parcela)"
              a={money(result.a.monthly)}
              b={money(result.b.monthly)}
              compare={[result.a.monthly, result.b.monthly]}
              strong={!financed}
            />
            <CompareRow
              label="Combustível / mês"
              a={money(result.a.fuel)}
              b={money(result.b.fuel)}
              compare={[result.a.fuel, result.b.fuel]}
            />
            <CompareRow
              label="Uso / ano"
              a={money(result.a.yearly)}
              b={money(result.b.yearly)}
              compare={[result.a.yearly, result.b.yearly]}
            />
            <CompareRow
              label="Custo por km"
              a={
                result.a.perKm === null ? "— (km zero)" : money(result.a.perKm)
              }
              b={
                result.b.perKm === null ? "— (km zero)" : money(result.b.perKm)
              }
              compare={[result.a.perKm, result.b.perKm]}
            />
          </CompareTable>
        </View>
      )}
    </Section>
  );
}
