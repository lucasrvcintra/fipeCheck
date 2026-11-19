import { FavoritesProvider } from '@/context/FavoritesContext';
import { Drawer } from 'expo-router/drawer';
import { ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router/react-navigation';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const theme = useColorScheme() === 'dark' ? DarkTheme : DefaultTheme;
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><ThemeProvider value={theme}>
    <FavoritesProvider><StatusBar style="auto" /><Drawer screenOptions={{ headerTitleAlign: 'center', drawerActiveTintColor: '#245bce' }}>
      <Drawer.Screen name="index" options={{ title: 'Início' }} />
      <Drawer.Screen name="fipe" options={{ title: 'FIPE' }} />
      <Drawer.Screen name="about" options={{ title: 'Sobre' }} />
    </Drawer></FavoritesProvider>
  </ThemeProvider></SafeAreaProvider></GestureHandlerRootView>;
}
