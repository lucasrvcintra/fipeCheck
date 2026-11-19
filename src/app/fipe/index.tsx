import { useFavorites } from "@/context/FavoritesContext";
import { vehicleId } from "@/types/fipe";
import { useState, useRef, useEffect, type ComponentRef } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/Screen";
import { OptionPicker, Segmented } from "@/components/OptionPicker";
import { Feedback } from "@/components/Feedback";
import { Card } from "@/components/Card";
import { useOptions } from "@/hooks/useOptions";
import { getDetails } from "@/services/fipeApi";
import { errorMessage } from "@/services/api";
import { ActionButton } from "@/components/ActionButton";
import { VehicleCard } from "@/components/VehicleCard";
import { space } from "@/constants/theme";
import type {
  Option,
  VehicleDetails,
  VehicleQuery,
  VehicleType,
} from "@/types/fipe";

const TYPES = [
  { value: "carros", label: "Carros", icon: "car-sport-outline" as const },
  { value: "motos", label: "Motos", icon: "bicycle-outline" as const },
  { value: "caminhoes", label: "Caminhões", icon: "bus-outline" as const },
];
/** Rótulo de ano/combustível ("32000 Gasolina" → "Zero km Gasolina"). */
function versionLabel(option: Option) {
  return option.label.replace(/^32000\b/, "Zero km");
}

export default function Consultation() {
  const favorites = useFavorites();
  const [type, setType] = useState<VehicleType>();
  const [brand, setBrand] = useState<string>();
  const [model, setModel] = useState<string>();
  const [version, setVersion] = useState<string>();
  const [result, setResult] = useState<{
    query: VehicleQuery;
    details: VehicleDetails;
  }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const active = useRef<AbortController | null>(null);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  useEffect(() => () => active.current?.abort(), []);

  const brands = useOptions(type ? `/fipe/marcas/v1/${type}` : null);
  const models = useOptions(
    type && brand ? `/fipe/veiculos/v1/${type}/${brand}` : null,
  );
  const years = useOptions(
    type && brand && model ? `/fipe/anos/v1/${type}/${brand}/${model}` : null,
  );

  // Ano e combustível vêm juntos da FIPE; com uma única opção, ela já é
  // selecionada.
  const versions = years.options.map((option) => ({
    value: option.value,
    label: versionLabel(option),
  }));
  const code =
    version && versions.some((option) => option.value === version)
      ? version
      : versions.length === 1
        ? versions[0].value
        : undefined;

  function clearResult() {
    active.current?.abort();
    setResult(undefined);
    setError(undefined);
    setLoading(false);
  }
  function reset() {
    clearResult();
    setType(undefined);
    setBrand(undefined);
    setModel(undefined);
    setVersion(undefined);
  }
  async function submit() {
    if (!type || !brand || !model || !code) return;
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setLoading(true);
    setResult(undefined);
    setError(undefined);
    const query = { type, brand, model, year: code };
    try {
      const details = await getDetails(query, controller.signal);
      if (!controller.signal.aborted) setResult({ query, details });
    } catch (err) {
      if (!controller.signal.aborted) setError(errorMessage(err));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  const saved =
    !!result &&
    favorites.favorites.some((item) => item.id === vehicleId(result.query));
  const savedResult =
    saved &&
    favorites.favorites.find((item) => item.id === vehicleId(result.query))
      ?.details === result.details;
  const started = !!type;

  return (
    <Screen
      tabs
      scrollRef={scroll}
      title="Consulta FIPE"
      subtitle="Escolha o veículo para ver o preço médio de mercado."
    >
      <Card>
        <Segmented
          label="Tipo de veículo"
          value={type}
          options={TYPES}
          onSelect={(option) => {
            if (option.value === type) return;
            clearResult();
            setType(option.value as VehicleType);
            setBrand(undefined);
            setModel(undefined);
            setVersion(undefined);
          }}
        />
        <OptionPicker
          label="Marca"
          value={brand}
          options={brands.options}
          loading={brands.loading}
          disabled={!type || !!brands.error}
          placeholder={type ? "Selecionar marca" : "Escolha o tipo primeiro"}
          onSelect={(option) => {
            clearResult();
            setBrand(option.value);
            setModel(undefined);
            setVersion(undefined);
          }}
        />
        <ResourceFeedback name="marcas" enabled={!!type} data={brands} />
        <OptionPicker
          label="Modelo"
          value={model}
          options={models.options}
          loading={models.loading}
          disabled={!brand || !!models.error}
          placeholder={brand ? "Selecionar modelo" : "Escolha a marca primeiro"}
          onSelect={(option) => {
            clearResult();
            setModel(option.value);
            setVersion(undefined);
          }}
        />
        <ResourceFeedback name="modelos" enabled={!!brand} data={models} />
        <OptionPicker
          label="Ano/combustível"
          value={code}
          options={versions}
          loading={years.loading}
          disabled={!model || !!years.error}
          placeholder={
            model ? "Selecionar ano/combustível" : "Escolha o modelo primeiro"
          }
          onSelect={(option) => {
            clearResult();
            setVersion(option.value);
          }}
        />
        <ResourceFeedback name="anos" enabled={!!model} data={years} />
        <ActionButton
          label={loading ? "Consultando..." : "Consultar preço"}
          icon="search"
          disabled={!code || loading}
          onPress={() => {
            void submit();
          }}
        />
        {started && (
          <ActionButton
            variant="ghost"
            compact
            icon="refresh"
            label="Limpar seleção"
            onPress={reset}
          />
        )}
      </Card>
      {loading && <Feedback loading message="Consultando preço na FIPE..." />}
      {error && (
        <Feedback
          title="Não foi possível consultar"
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
        // Ao aparecer, o resultado rola para a área visível.
        <View
          onLayout={(event) =>
            scroll.current?.scrollTo({
              y: Math.max(0, event.nativeEvent.layout.y - space.lg),
              animated: true,
            })
          }
        >
          <VehicleCard details={result.details} type={result.query.type}>
            {savedResult ? (
              <>
                <Feedback
                  tone="success"
                  message="Salvo nos favoritos. Disponível offline."
                />
                <View style={{ flexDirection: "row", gap: space.sm }}>
                  <View style={{ flex: 1 }}>
                    <ActionButton
                      variant="secondary"
                      icon="star"
                      label="Favoritos"
                      onPress={() => router.navigate("/fipe/favorites")}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ActionButton
                      variant="secondary"
                      icon="git-compare"
                      label="Comparar"
                      onPress={() => router.navigate("/fipe/compare")}
                    />
                  </View>
                </View>
              </>
            ) : (
              <ActionButton
                disabled={!favorites.ready || favorites.busy}
                icon={saved ? "sync" : "star-outline"}
                label={saved ? "Atualizar favorito" : "Salvar nos favoritos"}
                onPress={() => {
                  void favorites.add({
                    ...result,
                    id: vehicleId(result.query),
                    savedAt: new Date().toISOString(),
                  });
                }}
              />
            )}
          </VehicleCard>
        </View>
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
  if (!enabled || data.loading) return null;
  if (data.error) return <Feedback message={data.error} onRetry={data.retry} />;
  return !data.options.length ? (
    <Feedback message={`Nenhuma opção de ${name} disponível.`} />
  ) : null;
}
