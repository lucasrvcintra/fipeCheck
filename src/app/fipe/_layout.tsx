import { Tabs } from "expo-router";
import { navIcon as icon } from "@/components/NavIcon";
import { fonts, usePalette } from "@/constants/theme";
import { useFavorites } from "@/context/FavoritesContext";

export default function FipeLayout() {
  const c = usePalette();
  const { favorites, ready } = useFavorites();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: {
          backgroundColor: c.canvas,
          borderTopColor: c.hairline,
        },
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        tabBarBadgeStyle: {
          backgroundColor: c.primary,
          color: c.onPrimary,
          fontFamily: fonts.bold,
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Consulta",
          tabBarIcon: icon("search-outline", "search"),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favoritos",
          tabBarIcon: icon("star-outline", "star"),
          tabBarBadge: ready && favorites.length ? favorites.length : undefined,
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: "Comparativo",
          tabBarIcon: icon("git-compare-outline", "git-compare"),
        }}
      />
    </Tabs>
  );
}
