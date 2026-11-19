import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'expo-router/react-navigation';
import type { Option } from '@/types/fipe';
import { ActionButton } from './ActionButton';
import { ThemedText } from './ThemedText';
export function OptionPicker({ label, options, value, onSelect, disabled = false }: { label: string; options: Option[]; value?: string; onSelect: (option: Option) => void; disabled?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const { colors } = useTheme();
  const selected = options.find(option => option.value === value);
  function close() { setVisible(false); setSearch(''); }
  return <View style={styles.field}><ThemedText>{label}</ThemedText>
    <ActionButton label={selected?.label ?? `Selecionar ${label.toLowerCase()}`} disabled={disabled} onPress={() => setVisible(true)} />
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <SafeAreaView style={[styles.modal, { backgroundColor: colors.background }]}>
        <ThemedText style={styles.title}>{label}</ThemedText>
        <TextInput accessibilityLabel={`Buscar ${label}`} placeholder="Buscar..." placeholderTextColor={colors.text} value={search} onChangeText={setSearch} style={[styles.input, { color: colors.text, borderColor: colors.border }]} />
        <FlatList keyboardShouldPersistTaps="handled" data={options.filter(option => option.label.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))} keyExtractor={option => option.value}
          renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityState={{ selected: item.value === value }} onPress={() => { onSelect(item); close(); }} style={[styles.option, { borderColor: colors.border }]}><ThemedText>{item.value === value ? '✓ ' : ''}{item.label}</ThemedText></Pressable>}
          ListEmptyComponent={<ThemedText>Nenhuma opção encontrada.</ThemedText>} />
        <ActionButton label="Fechar" onPress={close} />
      </SafeAreaView>
    </Modal>
  </View>;
}
const styles = StyleSheet.create({ field: { gap: 8 }, modal: { flex: 1, padding: 20, gap: 16 }, title: { fontSize: 22, fontWeight: '700' }, input: { borderWidth: 1, padding: 12, borderRadius: 8, fontSize: 16 }, option: { paddingVertical: 16, borderBottomWidth: 1 } });
