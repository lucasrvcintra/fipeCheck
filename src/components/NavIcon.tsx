import { Ionicons } from "@expo/vector-icons";
import type { ColorValue } from "react-native";

type IconName = keyof typeof Ionicons.glyphMap;

/** Ícone para Drawer/Tabs; usa a versão preenchida quando a rota está ativa. */
export function navIcon(outline: IconName, filled: IconName = outline) {
  function NavIcon({
    color,
    size,
    focused,
  }: {
    color: ColorValue;
    size: number;
    focused: boolean;
  }) {
    return (
      <Ionicons
        name={focused ? filled : outline}
        color={typeof color === "string" ? color : undefined}
        size={size}
      />
    );
  }
  return NavIcon;
}
