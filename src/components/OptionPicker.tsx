import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { Option } from "@/types/fipe";
import { ThemedText } from "./ThemedText";
import { fonts, radius, space, usePalette } from "@/constants/theme";

function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase();
}

/** Campo de seleção que abre uma lista pesquisável em tela cheia. */
export function OptionPicker({
  label,
  options,
  value,
  onSelect,
  disabled = false,
  loading = false,
  placeholder,
  hint,
}: {
  label: string;
  options: Option[];
  value?: string;
  onSelect: (option: Option) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const c = usePalette();
  const selected = options.find((option) => option.value === value);
  const query = normalize(search.trim());
  const filtered = query
    ? options.filter((option) => normalize(option.label).includes(query))
    : options;
  const searchable = options.length > 8;
  function close() {
    setVisible(false);
    setSearch("");
  }
  return (
    <View style={styles.field}>
      <ThemedText variant="label">{label}</ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? "não selecionado"}`}
        accessibilityHint={hint ?? "Abre a lista de opções"}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        disabled={disabled || loading}
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          styles.select,
          {
            borderColor: selected ? c.primary : c.hairlineStrong,
            backgroundColor: pressed ? c.canvasSoft : c.canvas,
          },
          (disabled || loading) && {
            backgroundColor: c.canvasSoft,
            borderColor: c.hairline,
          },
        ]}
      >
        <ThemedText
          numberOfLines={2}
          style={[
            styles.value,
            { color: selected ? c.ink : disabled ? c.faint : c.muted },
          ]}
        >
          {loading
            ? "Carregando..."
            : (selected?.label ??
              placeholder ??
              `Selecionar ${label.toLowerCase()}`)}
        </ThemedText>
        {loading ? (
          <ActivityIndicator size="small" color={c.primary} />
        ) : (
          <Ionicons
            name="chevron-down"
            size={20}
            color={disabled ? c.faint : c.primary}
          />
        )}
      </Pressable>
      {hint && !selected && (
        <ThemedText variant="caption" tone="muted">
          {hint}
        </ThemedText>
      )}
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={close}
      >
        <SafeAreaView style={[styles.modal, { backgroundColor: c.canvas }]}>
          <View style={[styles.modalHead, { borderBottomColor: c.hairline }]}>
            <View style={{ flex: 1 }}>
              <ThemedText variant="h2">{label}</ThemedText>
              <ThemedText variant="caption" tone="muted">
                {filtered.length} de {options.length} opções
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              hitSlop={12}
              onPress={close}
              style={[styles.close, { backgroundColor: c.canvasSoft }]}
            >
              <Ionicons name="close" size={22} color={c.ink} />
            </Pressable>
          </View>
          {searchable && (
            <View
              style={[
                styles.search,
                {
                  borderColor: c.hairlineStrong,
                  backgroundColor: c.canvasSoft,
                },
              ]}
            >
              <Ionicons name="search" size={18} color={c.muted} />
              <TextInput
                accessibilityLabel={`Buscar ${label}`}
                placeholder={`Buscar ${label.toLowerCase()}...`}
                placeholderTextColor={c.faint}
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
                autoFocus
                returnKeyType="search"
                style={[styles.searchInput, { color: c.ink }]}
              />
              {!!search && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Limpar busca"
                  hitSlop={10}
                  onPress={() => setSearch("")}
                >
                  <Ionicons name="close-circle" size={18} color={c.muted} />
                </Pressable>
              )}
            </View>
          )}
          <FlatList
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            data={filtered}
            keyExtractor={(option) => option.value}
            contentContainerStyle={{ paddingBottom: space.xxxl }}
            renderItem={({ item }) => {
              const active = item.value === value;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    onSelect(item);
                    close();
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    { borderColor: c.hairline },
                    (pressed || active) && { backgroundColor: c.mint50 },
                  ]}
                >
                  <ThemedText
                    style={[
                      { flex: 1 },
                      active && { fontFamily: fonts.bold, color: c.primary },
                    ]}
                  >
                    {item.label}
                  </ThemedText>
                  {active && (
                    <Ionicons name="checkmark" size={20} color={c.primary} />
                  )}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="search-outline" size={32} color={c.faint} />
                <ThemedText tone="muted">
                  Nada encontrado para “{search.trim()}”.
                </ThemedText>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

/** Seletor segmentado para poucas opções fixas. */
export function Segmented({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: (Option & { icon?: keyof typeof Ionicons.glyphMap })[];
  value?: string;
  onSelect: (option: Option) => void;
}) {
  const c = usePalette();
  return (
    <View style={styles.field}>
      <ThemedText variant="label">{label}</ThemedText>
      <View style={styles.segments} accessibilityRole="radiogroup">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              onPress={() => onSelect(option)}
              style={({ pressed }) => [
                styles.segment,
                {
                  borderColor: active ? c.primary : c.hairlineStrong,
                  backgroundColor: active
                    ? c.mint100
                    : pressed
                      ? c.canvasSoft
                      : c.canvas,
                },
                active && { borderWidth: 2 },
              ]}
            >
              {option.icon && (
                <Ionicons
                  name={option.icon}
                  size={22}
                  color={active ? c.primary : c.muted}
                />
              )}
              <ThemedText
                variant="label"
                style={{ color: active ? c.primary : c.body }}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: space.xs + 2 },
  select: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    minHeight: 50,
  },
  value: { flex: 1, fontFamily: fonts.semibold },
  modal: { flex: 1 },
  modalHead: {
    flexDirection: "row",
    alignItems: "center",
    padding: space.xl,
    paddingBottom: space.lg,
    borderBottomWidth: 1,
    gap: space.md,
  },
  close: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    margin: space.lg,
    marginBottom: space.sm,
    paddingHorizontal: space.md,
    borderWidth: 1,
    borderRadius: radius.card,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingVertical: space.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: space.lg,
    paddingHorizontal: space.xl,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  empty: { alignItems: "center", gap: space.sm, padding: space.xxxl },
  segments: { flexDirection: "row", gap: space.sm },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
    borderWidth: 1,
    borderRadius: radius.card,
    paddingVertical: space.md,
    minHeight: 72,
  },
});
