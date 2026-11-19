import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
export default function FipeLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#245bce' }}>
    <Tabs.Screen name="index" options={{ title: 'Consulta', tabBarIcon: ({ color, size }) => <Ionicons name="search" color={typeof color === 'string' ? color : undefined} size={size} /> }} />
    <Tabs.Screen name="favorites" options={{ title: 'Favoritos', tabBarIcon: ({ color, size }) => <Ionicons name="star-outline" color={typeof color === 'string' ? color : undefined} size={size} /> }} />
    <Tabs.Screen name="compare" options={{ title: 'Comparativo', tabBarIcon: ({ color, size }) => <Ionicons name="swap-horizontal" color={typeof color === 'string' ? color : undefined} size={size} /> }} />
  </Tabs>;
}
