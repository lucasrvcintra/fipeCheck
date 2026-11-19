import { useState } from 'react';
import { Linking, View } from 'react-native';
import { MG_IPVA } from '@/data/ipva';
import { estimatedIpva, nonNegative, money } from '@/utils/calculations';
import { OptionPicker } from './OptionPicker';
import { NumberField } from './NumberField';
import { CompareRow } from './CompareRow';
import { Feedback } from './Feedback';
import { ActionButton } from './ActionButton';
import { RunningCostForm } from './RunningCostForm';
import { ThemedText } from './ThemedText';
export function FinancialScenario({ priceA, priceB }: { priceA: number; priceB: number }) {
  const [region, setRegion] = useState('MG');
  const [tax, setTax] = useState(String(MG_IPVA.percent));
  let annualA: number | undefined, annualB: number | undefined, taxError: string | undefined;
  try { const percent = nonNegative(tax, 'Alíquota'); annualA = estimatedIpva(priceA, percent); annualB = estimatedIpva(priceB, percent); }
  catch (error) { taxError = (error as Error).message; }
  return <View style={{ gap: 16 }}>
    <ThemedText style={{ fontSize: 22, fontWeight: '700' }}>IPVA estimado</ThemedText>
    <OptionPicker label="UF / cenário tributário" value={region} options={[{ label: 'MG — automóvel particular', value: 'MG' }, { label: 'Outra UF — alíquota manual', value: 'manual' }]} onSelect={option => { setRegion(option.value); setTax(option.value === 'MG' ? String(MG_IPVA.percent) : ''); }} />
    <NumberField label="Alíquota anual de IPVA (%)" value={tax} onChange={setTax} />
    <ThemedText>{region === 'MG' && tax === String(MG_IPVA.percent) ? `Regra geral MG, exercício ${MG_IPVA.year}: ${MG_IPVA.percent}%.` : 'Alíquota informada pelo usuário.'} Estimativa sobre a FIPE salva, sem isenções, descontos ou proporcionalidade. A base oficial da Sefaz pode ser diferente.</ThemedText>
    <ActionButton label="Fonte oficial de MG" onPress={() => { void Linking.openURL(MG_IPVA.source); }} />
    {taxError && <Feedback message={taxError} />}
    {annualA !== undefined && annualB !== undefined && <>
      <CompareRow label="IPVA anual estimado" a={money(annualA)} b={money(annualB)} />
      <CompareRow label="Provisão mensal de IPVA" a={money(annualA / 12)} b={money(annualB / 12)} />
      <RunningCostForm annualTaxA={annualA} annualTaxB={annualB} />
    </>}
  </View>;
}
