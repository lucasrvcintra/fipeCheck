import { FavoritesProvider } from "@/context/FavoritesContext";
import { Drawer } from "expo-router/drawer";
import { ThemeProvider } from "expo-router/react-navigation";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { navIcon } from "@/components/NavIcon";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  useFonts,
} from "@expo-google-fonts/montserrat";
import { fonts, navigationTheme, usePalette } from "@/constants/theme";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
  const c = usePalette();
  const [loaded, error] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });
  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync();
  }, [loaded, error]);
  if (!loaded && !error) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={navigationTheme(scheme)}>
          <FavoritesProvider>
            <StatusBar style="auto" />
            <Drawer
              screenOptions={{
                headerTitleAlign: "center",
                headerShadowVisible: false,
                headerStyle: { backgroundColor: c.canvas },
                headerTitleStyle: {
                  fontFamily: fonts.bold,
                  fontSize: 17,
                  color: c.ink,
                },
                headerTintColor: c.ink,
                drawerActiveTintColor: c.primary,
                drawerActiveBackgroundColor: c.mint100,
                drawerInactiveTintColor: c.body,
                drawerLabelStyle: { fontFamily: fonts.semibold },
                drawerItemStyle: { borderRadius: 8 },
                drawerStyle: { backgroundColor: c.canvas },
              }}
            >
              <Drawer.Screen
                name="index"
                options={{
                  title: "Início",
                  drawerIcon: navIcon("home-outline", "home"),
                }}
              />
              <Drawer.Screen
                name="fipe"
                options={{
                  title: "FIPE",
                  drawerLabel: "Consulta e comparação",
                  drawerIcon: navIcon("car-sport-outline", "car-sport"),
                }}
              />
              <Drawer.Screen
                name="about"
                options={{
                  title: "Sobre",
                  drawerIcon: navIcon(
                    "information-circle-outline",
                    "information-circle",
                  ),
                }}
              />
            </Drawer>
          </FavoritesProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
