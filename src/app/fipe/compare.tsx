import { RunningCostForm } from '@/components/RunningCostForm';
import { useState } from 'react';
import { Screen } from '@/components/Screen';
import { OptionPicker } from '@/components/OptionPicker';
import { CompareRow } from '@/components/CompareRow';
import { ThemedText } from '@/components/ThemedText';
import { Feedback } from '@/components/Feedback';
import { ActionButton } from '@/components/ActionButton';
import { router } from 'expo-router';
import { useFavorites } from '@/context/FavoritesContext';
import { parseNumber, comparePrices, money } from '@/utils/calculations';
import type { Favorite } from '@/types/fipe';
export default function Compare() {
  const { favorites, ready, error, retry } = useFavorites();
  const [selectedA, setA] = useState<string>();
  const [selectedB, setB] = useState<string>();
  const cars = favorites.filter(item => item.query.type === 'carros');
  const a = cars.find(item => item.id === selectedA);
  const b = cars.find(item => item.id === selectedB && item.id !== a?.id);
  const options = cars.map(item => ({ value: item.id, label: `${item.details.modelo} · ${item.details.anoModelo} · ${item.details.combustivel}` }));
  return <Screen title="Comparativo">
    <ThemedText>Selecione dois carros favoritos. Os cálculos usam os preços salvos e funcionam offline.</ThemedText>
    {error && <Feedback message={error} onRetry={retry} />}
    {!ready && !error && <Feedback loading message="Lendo favoritos..." />}
    {ready && cars.length < 2 ? <><Feedback message="Salve pelo menos dois carros para comparar. Motos e caminhões continuam disponíveis na consulta e nos favoritos." /><ActionButton label="Consultar FIPE" onPress={() => router.navigate('./')} /></> : <>
      <OptionPicker label="Carro A" options={options} value={a?.id} onSelect={option => { setA(option.value); if (option.value === selectedB) setB(undefined); }} />
      <OptionPicker label="Carro B" options={options.filter(item => item.value !== a?.id)} value={b?.id} disabled={!a} onSelect={option => setB(option.value)} />
    </>}
    {a && b && <Comparison key={`${a.id}:${b.id}`} a={a} b={b} />}
  </Screen>;
}
function Comparison({ a, b }: { a: Favorite; b: Favorite }) {
  let priceA: number, priceB: number;
  try { priceA = parseNumber(a.details.valor); priceB = parseNumber(b.details.valor); if (priceA < 0 || priceB < 0) throw new Error(); }
  catch { return <Feedback message="Um dos preços salvos é inválido. Consulte novamente o veículo." />; }
  const comparison = comparePrices(priceA, priceB);
  return <>
    <ThemedText style={{ fontSize: 22, fontWeight: '700' }}>Compra</ThemedText>
    <CompareRow label="Modelo" a={`${a.details.marca} ${a.details.modelo}`} b={`${b.details.marca} ${b.details.modelo}`} />
    <CompareRow label="Ano / combustível" a={`${a.details.anoModelo} / ${a.details.combustivel}`} b={`${b.details.anoModelo} / ${b.details.combustivel}`} />
    <CompareRow label="Preço FIPE salvo" a={money(priceA)} b={money(priceB)} />
    <CompareRow label="Referência" a={a.details.mesReferencia} b={b.details.mesReferencia} />
    <CompareRow label="Data da consulta" a={a.details.dataConsulta} b={b.details.dataConsulta} />
    {a.details.mesReferencia.trim() !== b.details.mesReferencia.trim() && <Feedback message="As referências FIPE são diferentes. Considere consultar novamente antes de comparar." />}
    <ThemedText>{comparison.difference === 0 ? 'Os preços de compra são iguais.' : `B custa ${money(Math.abs(comparison.difference))} ${comparison.difference > 0 ? 'a mais' : 'a menos'} que A.${comparison.percent === null ? ' Percentual indisponível.' : ` Diferença de ${Math.abs(comparison.percent).toFixed(2)}% sobre A.`}`}</ThemedText>
    <RunningCostForm />
  </>;
}
