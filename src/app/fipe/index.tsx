import { useFavorites } from "@/context/FavoritesContext";
import { vehicleId } from "@/types/fipe";
import { useState, useRef, useEffect } from "react";
import { Screen } from "@/components/Screen";
import { OptionPicker } from "@/components/OptionPicker";
import { Feedback } from "@/components/Feedback";
import { useOptions } from "@/hooks/useOptions";
import { getDetails } from "@/services/fipeApi";
import { errorMessage } from "@/services/api";
import { ActionButton } from "@/components/ActionButton";
import { VehicleCard } from "@/components/VehicleCard";
import type { VehicleDetails, VehicleQuery, VehicleType } from "@/types/fipe";
export default function Consultation() {
  const favorites = useFavorites();
  const [type, setType] = useState<VehicleType>();
  const [brand, setBrand] = useState<string>();
  const [model, setModel] = useState<string>();
  const [year, setYear] = useState<string>();
  const [result, setResult] = useState<{
    query: VehicleQuery;
    details: VehicleDetails;
  }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  function clearResult() {
    active.current?.abort();
    setResult(undefined);
    setError(undefined);
    setLoading(false);
  }
  async function submit() {
    if (!type || !brand || !model || !year) return;
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setLoading(true);
    setResult(undefined);
    setError(undefined);
    const query = { type, brand, model, year };
    try {
      const details = await getDetails(query, controller.signal);
      if (!controller.signal.aborted) setResult({ query, details });
    } catch (err) {
      if (!controller.signal.aborted) setError(errorMessage(err));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }
  const brands = useOptions(type ? `/fipe/marcas/v1/${type}` : null);
  const models = useOptions(
    type && brand ? `/fipe/veiculos/v1/${type}/${brand}` : null,
  );
  const years = useOptions(
    type && brand && model ? `/fipe/anos/v1/${type}/${brand}/${model}` : null,
  );
  return (
    <Screen tabs title="Consulta FIPE">
      <OptionPicker
        label="Tipo de veículo"
        value={type}
        options={[
          { value: "carros", label: "Carros" },
          { value: "motos", label: "Motos" },
          { value: "caminhoes", label: "Caminhões" },
        ]}
        onSelect={(option) => {
          clearResult();
          setType(option.value as VehicleType);
          setBrand(undefined);
          setModel(undefined);
          setYear(undefined);
        }}
      />
      <OptionPicker
        label="Marca"
        value={brand}
        options={brands.options}
        disabled={!type || brands.loading || !!brands.error}
        onSelect={(option) => {
          clearResult();
          setBrand(option.value);
          setModel(undefined);
          setYear(undefined);
        }}
      />
      <OptionPicker
        label="Modelo"
        value={model}
        options={models.options}
        disabled={!brand || models.loading || !!models.error}
        onSelect={(option) => {
          clearResult();
          setModel(option.value);
          setYear(undefined);
        }}
      />
      <OptionPicker
        label="Ano e combustível"
        value={year}
        options={years.options}
        disabled={!model || years.loading || !!years.error}
        onSelect={(option) => {
          clearResult();
          setYear(option.value);
        }}
      />
      <ResourceFeedback name="marcas" enabled={!!type} data={brands} />
      <ResourceFeedback name="modelos" enabled={!!brand} data={models} />
      <ResourceFeedback name="anos" enabled={!!model} data={years} />
      <ActionButton
        label="Consultar FIPE"
        disabled={!year || loading}
        onPress={() => {
          void submit();
        }}
      />
      {loading && <Feedback loading message="Consultando preço..." />}
      {error && (
        <Feedback
          message={error}
          onRetry={() => {
            void submit();
          }}
        />
      )}
      {favorites.error && (
        <Feedback message={favorites.error} onRetry={favorites.retry} />
      )}
      {result && (
        <VehicleCard details={result.details}>
          <ActionButton
            disabled={!favorites.ready || favorites.busy}
            label={
              favorites.favorites.some(
                (item) => item.id === vehicleId(result.query),
              )
                ? "Atualizar favorito"
                : "Salvar favorito"
            }
            onPress={() => {
              void favorites.add({
                ...result,
                id: vehicleId(result.query),
                savedAt: new Date().toISOString(),
              });
            }}
          />
        </VehicleCard>
      )}
    </Screen>
  );
}
function ResourceFeedback({
  name,
  enabled,
  data,
}: {
  name: string;
  enabled: boolean;
  data: ReturnType<typeof useOptions>;
}) {
  if (!enabled) return null;
  if (data.loading)
    return <Feedback loading message={`Carregando ${name}...`} />;
  if (data.error) return <Feedback message={data.error} onRetry={data.retry} />;
  return !data.options.length ? (
    <Feedback message={`Nenhuma opção de ${name} disponível.`} />
  ) : null;
}
