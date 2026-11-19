import { useState } from 'react';
import { View } from 'react-native';
import { NumberField } from './NumberField';
import { ActionButton } from './ActionButton';
import { Feedback } from './Feedback';
import { CompareRow } from './CompareRow';
import { ThemedText } from './ThemedText';
import { useStoredState } from '@/hooks/useStoredState';
import { money, nonNegative, runningCosts } from '@/utils/calculations';
const INITIAL = { km: '1000', fuelPrice: '6' };
function validPreferences(data: unknown): data is typeof INITIAL {
  if (!data || typeof data !== 'object' || !('km' in data) || !('fuelPrice' in data) || typeof data.km !== 'string' || typeof data.fuelPrice !== 'string') return false;
  try { return nonNegative(data.km, 'Km') >= 0 && nonNegative(data.fuelPrice, 'Combustível') > 0; } catch { return false; }
}
export function RunningCostForm({ annualTaxA = 0, annualTaxB = 0, installmentA = 0, installmentB = 0 }: { annualTaxA?: number; annualTaxB?: number; installmentA?: number; installmentB?: number }) {
  const preferences = useStoredState('fipecheck_usage_v1', INITIAL, validPreferences);
  const [shared, setShared] = useState<{ km?: string; fuelPrice?: string }>({});
  const [fields, setFields] = useState({ consumptionA: '', consumptionB: '', maintenanceA: '0', maintenanceB: '0', insuranceA: '0', insuranceB: '0' });
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const km = shared.km ?? preferences.value.km;
  const fuelPrice = shared.fuelPrice ?? preferences.value.fuelPrice;
  function calculate() {
    const common = { km: nonNegative(km, 'Quilometragem'), fuelPrice: nonNegative(fuelPrice, 'Preço do litro') };
    const a = runningCosts({ ...common, consumption: nonNegative(fields.consumptionA, 'Consumo A'), maintenance: nonNegative(fields.maintenanceA, 'Manutenção A'), insurance: nonNegative(fields.insuranceA, 'Seguro A'), annualTax: annualTaxA });
    const b = runningCosts({ ...common, consumption: nonNegative(fields.consumptionB, 'Consumo B'), maintenance: nonNegative(fields.maintenanceB, 'Manutenção B'), insurance: nonNegative(fields.insuranceB, 'Seguro B'), annualTax: annualTaxB });
    return { a, b };
  }
  let result: ReturnType<typeof calculate> | undefined, error: string | undefined;
  if (submitted) { try { result = calculate(); } catch (err) { error = (err as Error).message; } }
  return <View style={{ gap: 16 }}><ThemedText style={{ fontSize: 22, fontWeight: '700' }}>Uso</ThemedText>
    <ThemedText>Valores iniciais são exemplos editáveis. Manutenção e seguro começam em zero; informe suas estimativas mensais. Use vírgula para decimais.</ThemedText>
    {!preferences.ready && !preferences.error && <Feedback loading message="Lendo preferências..." />}
    {preferences.error && <Feedback message={preferences.error} onRetry={preferences.retry} />}
    <NumberField label="Quilometragem mensal (km)" value={km} onChange={value => { setShared(s => ({ ...s, km: value })); setSaved(false); }} />
    <NumberField label="Preço do litro (R$)" value={fuelPrice} onChange={value => { setShared(s => ({ ...s, fuelPrice: value })); setSaved(false); }} />
    {(Object.keys(fields) as (keyof typeof fields)[]).map(key => <NumberField key={key} label={LABELS[key]} value={fields[key]} onChange={value => setFields(s => ({ ...s, [key]: value }))} />)}
    <ActionButton label="Calcular custo de uso" onPress={() => setSubmitted(true)} />
    <ActionButton label="Salvar km e preço do litro" disabled={!preferences.ready || preferences.busy} onPress={() => {
      try { if (!validPreferences({ km, fuelPrice })) throw new Error(); void preferences.save({ km, fuelPrice }).then(setSaved); }
      catch { setSubmitted(true); }
    }} />
    {saved && <ThemedText>Preferências salvas no dispositivo.</ThemedText>}
    {error && <Feedback message={error} />}
    {result && <>
      <CompareRow label="Combustível / mês" a={money(result.a.fuel)} b={money(result.b.fuel)} />
      <CompareRow label="Uso / mês (sem parcela)" a={money(result.a.monthly)} b={money(result.b.monthly)} />
      <CompareRow label="Uso / ano" a={money(result.a.yearly)} b={money(result.b.yearly)} />
      <CompareRow label="Custo por km" a={result.a.perKm === null ? 'Indisponível: km zero' : money(result.a.perKm)} b={result.b.perKm === null ? 'Indisponível: km zero' : money(result.b.perKm)} />
      <CompareRow label="Uso + parcela / mês" a={money(result.a.monthly + installmentA)} b={money(result.b.monthly + installmentB)} />
      <ThemedText>{result.a.monthly === result.b.monthly ? 'Os custos mensais de uso são iguais.' : `B custa ${money(Math.abs(result.b.monthly - result.a.monthly))} ${result.b.monthly > result.a.monthly ? 'a mais' : 'a menos'} por mês de uso que A neste cenário.`}</ThemedText>
    </>}
  </View>;
}
const LABELS = { consumptionA: 'Consumo A (km/l)', consumptionB: 'Consumo B (km/l)', maintenanceA: 'Manutenção A / mês (R$)', maintenanceB: 'Manutenção B / mês (R$)', insuranceA: 'Seguro A / mês (R$)', insuranceB: 'Seguro B / mês (R$)' };
