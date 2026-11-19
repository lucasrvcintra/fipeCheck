import { useState } from 'react';
import { Screen } from '@/components/Screen';
import { OptionPicker } from '@/components/OptionPicker';
import { Feedback } from '@/components/Feedback';
import { ThemedText } from '@/components/ThemedText';
import { useOptions } from '@/hooks/useOptions';
import type { VehicleType } from '@/types/fipe';
export default function Consultation() {
  const [type, setType] = useState<VehicleType>();
  const [brand, setBrand] = useState<string>();
  const [model, setModel] = useState<string>();
  const [year, setYear] = useState<string>();
  const brands = useOptions(type ? `/fipe/marcas/v1/${type}` : null);
  const models = useOptions(type && brand ? `/fipe/veiculos/v1/${type}/${brand}` : null);
  const years = useOptions(type && brand && model ? `/fipe/anos/v1/${type}/${brand}/${model}` : null);
  return <Screen title="Consulta FIPE">
    <OptionPicker label="Tipo de veículo" value={type} options={[{ value: 'carros', label: 'Carros' }, { value: 'motos', label: 'Motos' }, { value: 'caminhoes', label: 'Caminhões' }]} onSelect={option => { setType(option.value as VehicleType); setBrand(undefined); setModel(undefined); setYear(undefined); }} />
    <OptionPicker label="Marca" value={brand} options={brands.options} disabled={!type || brands.loading || !!brands.error} onSelect={option => { setBrand(option.value); setModel(undefined); setYear(undefined); }} />
    <OptionPicker label="Modelo" value={model} options={models.options} disabled={!brand || models.loading || !!models.error} onSelect={option => { setModel(option.value); setYear(undefined); }} />
    <OptionPicker label="Ano e combustível" value={year} options={years.options} disabled={!model || years.loading || !!years.error} onSelect={option => setYear(option.value)} />
    {[['marcas', type, brands], ['modelos', brand, models], ['anos', model, years]].map(([name, selected, resource]) => {
      const data = resource as typeof brands;
      return <ResourceFeedback key={String(name)} name={String(name)} enabled={!!selected} data={data} />;
    })}
    {year && <ThemedText>Seleção completa. Pronta para consultar o preço.</ThemedText>}
  </Screen>;
}
function ResourceFeedback({ name, enabled, data }: { name: string; enabled: boolean; data: ReturnType<typeof useOptions> }) {
  if (!enabled) return null;
  if (data.loading) return <Feedback loading message={`Carregando ${name}...`} />;
  if (data.error) return <Feedback message={data.error} onRetry={data.retry} />;
  return !data.options.length ? <Feedback message={`Nenhuma opção de ${name} disponível.`} /> : null;
}
