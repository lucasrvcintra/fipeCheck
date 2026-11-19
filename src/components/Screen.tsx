import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import type { ReactNode } from 'react';

export function Screen({ title, children, scroll = true }: { title: string; children: ReactNode; scroll?: boolean }) {
  const content = <><ThemedText style={styles.title}>{title}</ThemedText>{children}</>;
  return <ThemedView style={styles.root}><SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
    {scroll ? <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">{content}</ScrollView> : <View style={[styles.content, styles.root]}>{content}</View>}
  </SafeAreaView></ThemedView>;
}
const styles = StyleSheet.create({ root: { flex: 1 }, content: { padding: 20, gap: 16, width: '100%', maxWidth: 820, alignSelf: 'center' }, title: { fontSize: 26, fontWeight: '700', lineHeight: 34 } });
