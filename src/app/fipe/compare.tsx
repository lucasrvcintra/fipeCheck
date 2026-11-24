import { FinancialScenario } from "@/components/FinancialScenario";
import { useRef, useState, type ComponentRef, type RefObject } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { OptionPicker } from "@/components/OptionPicker";
import {
  CompareRow,
  CompareTable,
  StatBlock,
  Badge,
} from "@/components/CompareRow";
import { Feedback } from "@/components/Feedback";
import { ActionButton } from "@/components/ActionButton";
import { Card } from "@/components/Card";
import { Section } from "@/components/Section";
import { StepIndicator, StepNav, StepPanel } from "@/components/Stepper";
import { router } from "expo-router";
import { useFavorites } from "@/context/FavoritesContext";
import { parseNumber, comparePrices, money } from "@/utils/calculations";
import { radius, space, usePalette } from "@/constants/theme";
import type { Favorite } from "@/types/fipe";

export default function Compare() {
  const { favorites, ready, error, retry } = useFavorites();
  const c = usePalette();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [selectedA, setA] = useState<string>();
  const [selectedB, setB] = useState<string>();
  const cars = favorites.filter((item) => item.query.type === "carros");
  if (ready && selectedA && !cars.some((item) => item.id === selectedA))
    setA(undefined);
  if (ready && selectedB && !cars.some((item) => item.id === selectedB))
    setB(undefined);
  const a = cars.find((item) => item.id === selectedA);
  const b = cars.find((item) => item.id === selectedB && item.id !== a?.id);
  const options = cars.map((item) => ({
    value: item.id,
    label: `${item.details.marca} ${item.details.modelo} · ${item.details.anoModelo === 32000 ? "0 km" : item.details.anoModelo} · ${item.details.combustivel}`,
  }));
  return (
    <Screen
      tabs
      scrollRef={scrollRef}
      title="Comparativo"
      subtitle="Compare compra, financiamento, IPVA, custo de uso e aplicação do dinheiro de dois carros salvos."
    >
      {error && <Feedback message={error} onRetry={retry} />}
      {!ready && !error && <Feedback loading message="Lendo favoritos..." />}
      {ready && cars.length < 2 ? (
        <Card
          tone="mint"
          style={{ alignItems: "center", paddingVertical: space.xxl }}
        >
          <Ionicons name="git-compare-outline" size={36} color={c.primary} />
          <ThemedHeading count={cars.length} />
          <ActionButton
            icon="search"
            label="Consultar FIPE"
            onPress={() => router.navigate("/fipe")}
          />
        </Card>
      ) : (
        ready && (
          <Card>
            <View style={styles.pickerRow}>
              <View style={styles.badgeCol}>
                <Badge letter="A" />
              </View>
              <View style={{ flex: 1 }}>
                <OptionPicker
                  label="Carro A"
                  options={options}
                  value={a?.id}
                  placeholder="Escolher carro A"
                  onSelect={(option) => {
                    setA(option.value);
                    if (option.value === selectedB) setB(undefined);
                  }}
                />
              </View>
            </View>
            <View style={styles.swapRow}>
              <View style={[styles.line, { backgroundColor: c.hairline }]} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Inverter carros A e B"
                disabled={!a || !b}
                onPress={() => {
                  setA(b?.id);
                  setB(a?.id);
                }}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.swap,
                  {
                    borderColor: c.hairlineStrong,
                    backgroundColor: pressed ? c.mint100 : c.canvas,
                  },
                  (!a || !b) && { opacity: 0.4 },
                ]}
              >
                <Ionicons name="swap-vertical" size={18} color={c.primary} />
              </Pressable>
              <View style={[styles.line, { backgroundColor: c.hairline }]} />
            </View>
            <View style={styles.pickerRow}>
              <View style={styles.badgeCol}>
                <Badge letter="B" />
              </View>
              <View style={{ flex: 1 }}>
                <OptionPicker
                  label="Carro B"
                  options={options.filter((item) => item.value !== a?.id)}
                  value={b?.id}
                  disabled={!a}
                  placeholder={
                    a ? "Escolher carro B" : "Escolha o carro A primeiro"
                  }
                  onSelect={(option) => setB(option.value)}
                />
              </View>
            </View>
          </Card>
        )
      )}
      {a && b && (
        <Comparison
          key={JSON.stringify([a.id, b.id].sort())}
          a={a}
          b={b}
          scrollRef={scrollRef}
        />
      )}
    </Screen>
  );
}

function ThemedHeading({ count }: { count: number }) {
  return (
    <Feedback
      tone="info"
      title={count === 0 ? "Nenhum carro salvo" : "Falta 1 carro"}
      message="Salve pelo menos dois carros nos favoritos para comparar. Motos e caminhões ficam disponíveis só na consulta e nos favoritos."
    />
  );
}

const STEPS = [
  "Compra",
  "Financiamento",
  "IPVA estimado",
  "Custo de uso",
  "Aplicação",
];

function Comparison({
  a,
  b,
  scrollRef,
}: {
  a: Favorite;
  b: Favorite;
  scrollRef: RefObject<ComponentRef<typeof ScrollView> | null>;
}) {
  // A key do componente reinicia o passo quando a dupla de carros muda.
  const [step, setStep] = useState(0);
  const [stepperY, setStepperY] = useState(0);
  const goTo = (index: number) => {
    setStep(index);
    scrollRef.current?.scrollTo({
      y: Math.max(stepperY - space.md, 0),
      animated: true,
    });
  };
  let priceA: number, priceB: number;
  try {
    priceA = parseNumber(a.details.valor);
    priceB = parseNumber(b.details.valor);
    if (priceA < 0 || priceB < 0) throw new Error();
  } catch {
    return (
      <Feedback message="Um dos preços salvos é inválido. Consulte novamente o veículo." />
    );
  }
  const comparison = comparePrices(priceA, priceB);
  const nameA = a.details.modelo;
  const nameB = b.details.modelo;
  const percent =
    comparison.percent === null
      ? "Percentual indisponível (preço de A é zero)."
      : `${Math.abs(comparison.percent).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% ${comparison.difference > 0 ? "mais caro" : "mais barato"} que o A.`;
  return (
    <>
      <StatBlock
        eyebrow="Diferença de compra"
        value={
          comparison.difference === 0
            ? "Mesmo preço"
            : `${comparison.difference > 0 ? "+" : "−"} ${money(Math.abs(comparison.difference))}`
        }
        caption={
          comparison.difference === 0
            ? "Os dois carros têm o mesmo preço FIPE salvo."
            : `O carro B é ${percent}`
        }
      />
      <View onLayout={(event) => setStepperY(event.nativeEvent.layout.y)}>
        <StepIndicator steps={STEPS} current={step} onSelect={goTo} />
      </View>
      <StepPanel active={step === 0}>
        <Section step="Passo 1 de 5" title="Compra">
          {a.details.mesReferencia.trim() !==
            b.details.mesReferencia.trim() && (
            <Feedback
              tone="tip"
              title="Referências FIPE diferentes"
              message="Os preços são de meses diferentes. Consulte novamente os dois carros para uma comparação justa."
            />
          )}
          <CompareTable nameA={nameA} nameB={nameB}>
            <CompareRow
              label="Preço FIPE salvo"
              a={money(priceA)}
              b={money(priceB)}
              compare={[priceA, priceB]}
              strong
            />
            <CompareRow
              label="Marca e modelo"
              a={`${a.details.marca} ${a.details.modelo}`}
              b={`${b.details.marca} ${b.details.modelo}`}
            />
            <CompareRow
              label="Ano / combustível"
              a={`${a.details.anoModelo === 32000 ? "0 km" : a.details.anoModelo} / ${a.details.combustivel}`}
              b={`${b.details.anoModelo === 32000 ? "0 km" : b.details.anoModelo} / ${b.details.combustivel}`}
            />
            <CompareRow
              label="Mês de referência"
              a={a.details.mesReferencia.trim()}
              b={b.details.mesReferencia.trim()}
            />
            <CompareRow
              label="Data da consulta"
              a={a.details.dataConsulta}
              b={b.details.dataConsulta}
            />
          </CompareTable>
        </Section>
      </StepPanel>
      <FinancialScenario
        step={step}
        idA={a.id}
        idB={b.id}
        modelYearA={a.details.anoModelo}
        modelYearB={b.details.anoModelo}
        priceA={priceA}
        priceB={priceB}
        nameA={nameA}
        nameB={nameB}
      />
      <StepNav steps={STEPS} current={step} onChange={goTo} />
    </>
  );
}

const styles = StyleSheet.create({
  pickerRow: { flexDirection: "row", gap: space.md },
  badgeCol: { paddingTop: 2 },
  swapRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  line: { flex: 1, height: 1 },
  swap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
