import { Stack } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router/react-navigation';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return <SafeAreaProvider><ThemeProvider value={useColorScheme() === 'dark' ? DarkTheme : DefaultTheme}>
    <StatusBar style="auto" /><Stack screenOptions={{ headerTitle: 'fipeCheck' }} />
  </ThemeProvider></SafeAreaProvider>;
}
