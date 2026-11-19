import { View, StyleSheet } from 'react-native';
import { useTheme } from 'expo-router/react-navigation';
import type { VehicleDetails } from '@/types/fipe';
import { ThemedText } from './ThemedText';
import type { ReactNode } from 'react';
export function VehicleCard({ details, children }: { details: VehicleDetails; children?: ReactNode }) {
  const { colors } = useTheme();
  return <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
    <ThemedText style={styles.title}>{details.marca} {details.modelo}</ThemedText>
    <ThemedText style={styles.price}>{details.valor}</ThemedText>
    <ThemedText>{details.anoModelo === 32000 ? 'Zero km' : details.anoModelo} · {details.combustivel}</ThemedText>
    <ThemedText>FIPE {details.codigoFipe} · Referência: {details.mesReferencia.trim()}</ThemedText>
    <ThemedText>Consulta: {details.dataConsulta}</ThemedText>{children}
  </View>;
}
const styles = StyleSheet.create({ card: { padding: 16, borderWidth: 1, borderRadius: 12, gap: 10 }, title: { fontWeight: '700' }, price: { color: '#245bce', fontWeight: '700', fontSize: 24, lineHeight: 32 } });
