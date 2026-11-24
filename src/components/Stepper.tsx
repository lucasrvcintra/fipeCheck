import { Pressable, StyleSheet, View } from "react-native";
import type { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { ActionButton } from "./ActionButton";
import { radius, space, usePalette } from "@/constants/theme";

/**
 * Indicador de passos do comparativo. Feito com View/Pressable porque o Expo
 * não oferece um componente de wizard: o `Stepper` do @expo/ui é um controle
 * numérico de +/− e o `PagerView` não funciona na web.
 */
export function StepIndicator({
  steps,
  current,
  onSelect,
}: {
  steps: string[];
  current: number;
  onSelect: (index: number) => void;
}) {
  const c = usePalette();
  return (
    <View style={styles.indicator}>
      <View style={styles.track} accessibilityRole="tablist">
        {steps.map((label, index) => {
          const active = index === current;
          const done = index < current;
          return (
            <View key={label} style={[styles.item, index > 0 && styles.grow]}>
              {index > 0 && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor:
                        done || active ? c.primary : c.hairlineStrong,
                    },
                  ]}
                />
              )}
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Passo ${index + 1} de ${steps.length}: ${label}`}
                onPress={() => onSelect(index)}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.dot,
                  {
                    borderColor: active || done ? c.primary : c.hairlineStrong,
                    backgroundColor: active
                      ? c.primary
                      : done
                        ? c.mint100
                        : pressed
                          ? c.mint50
                          : c.canvas,
                  },
                ]}
              >
                {done ? (
                  <Ionicons name="checkmark" size={16} color={c.primary} />
                ) : (
                  <ThemedText
                    variant="label"
                    style={{ color: active ? c.onPrimary : c.muted }}
                  >
                    {index + 1}
                  </ThemedText>
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
      <View style={styles.caption}>
        <ThemedText variant="eyebrow" tone="primary">
          Passo {current + 1} de {steps.length}
        </ThemedText>
        <ThemedText variant="h3">{steps[current]}</ThemedText>
      </View>
    </View>
  );
}

export function StepNav({
  steps,
  current,
  onChange,
}: {
  steps: string[];
  current: number;
  onChange: (index: number) => void;
}) {
  const last = current === steps.length - 1;
  return (
    <View style={styles.nav}>
      <View style={styles.navButton}>
        <ActionButton
          label="Anterior"
          icon="chevron-back"
          variant="outline"
          disabled={current === 0}
          onPress={() => onChange(current - 1)}
        />
      </View>
      {!last && (
        <View style={styles.navButton}>
          <ActionButton
            label="Próximo"
            accessibilityHint={`Vai para ${steps[current + 1]}`}
            onPress={() => onChange(current + 1)}
          />
        </View>
      )}
    </View>
  );
}

/** Mantém o passo montado (preserva o estado dos campos) e só o exibe quando ativo. */
export function StepPanel({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <View style={[styles.panel, !active && styles.hidden]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  indicator: { gap: space.md },
  track: { flexDirection: "row", alignItems: "center" },
  item: { flexDirection: "row", alignItems: "center" },
  grow: { flex: 1 },
  connector: { flex: 1, height: 2 },
  dot: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  caption: { gap: 2 },
  nav: { flexDirection: "row", gap: space.md },
  navButton: { flex: 1 },
  panel: { gap: space.xl },
  hidden: { display: "none" },
});
