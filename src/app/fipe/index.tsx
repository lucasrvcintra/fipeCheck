import { useState } from 'react';
import { Screen } from '@/components/Screen';
import { OptionPicker } from '@/components/OptionPicker';
import { Feedback } from '@/components/Feedback';
import { useOptions } from '@/hooks/useOptions';
import type { VehicleType } from '@/types/fipe';
export default function Consultation() {
  const [type, setType] = useState<VehicleType>();
  const [brand, setBrand] = useState<string>();
  const brands = useOptions(type ? `/fipe/marcas/v1/${type}` : null);
  return <Screen title="Consulta FIPE">
    <OptionPicker label="Tipo de veículo" value={type} options={[{ value: 'carros', label: 'Carros' }, { value: 'motos', label: 'Motos' }, { value: 'caminhoes', label: 'Caminhões' }]} onSelect={option => { setType(option.value as VehicleType); setBrand(undefined); }} />
    <OptionPicker label="Marca" value={brand} options={brands.options} disabled={!type || brands.loading || !!brands.error} onSelect={option => setBrand(option.value)} />
    {brands.loading && <Feedback loading message="Carregando marcas..." />}
    {brands.error && <Feedback message={brands.error} onRetry={brands.retry} />}
    {type && !brands.loading && !brands.error && !brands.options.length && <Feedback message="Nenhuma marca disponível." />}
  </Screen>;
}
