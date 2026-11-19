import { useColorScheme } from "react-native";
import { DarkTheme, DefaultTheme } from "expo-router/react-navigation";

/**
 * Tokens inspirados no DESIGN.md da NerdWallet (getdesign.md/nerdwallet):
 * verde spruce apenas para ações e estados ativos, superfícies mint para
 * separar seções, hairlines no lugar de sombras e raio pequeno nos controles.
 * O documento não define modo escuro; a paleta escura abaixo é derivada.
 */
const light = {
  primary: "#008254",
  primaryPressed: "#006642",
  onPrimary: "#ffffff",
  forest: "#00482f",
  onForest: "#ffffff",
  lime: "#9ae600",
  limePanel: "#e8fdac",
  onLimePanel: "#00482f",
  canvas: "#ffffff",
  canvasSoft: "#f7f7f7",
  mint50: "#effcf8",
  mint100: "#e3faf2",
  mint200: "#b7ecda",
  hairline: "#ebebec",
  hairlineStrong: "#d8d9da",
  ink: "#000000",
  body: "#3d4045",
  muted: "#64666a",
  faint: "#b1b3b5",
  link: "#005fb9",
  error: "#de2828",
  errorSurface: "#fdecec",
  better: "#008254",
  worse: "#de2828",
};

export type Palette = typeof light;

const dark: Palette = {
  primary: "#3ccf91",
  primaryPressed: "#2fb07a",
  onPrimary: "#00241a",
  forest: "#0e3a2a",
  onForest: "#ffffff",
  lime: "#9ae600",
  limePanel: "#2b3a12",
  onLimePanel: "#e8fdac",
  canvas: "#0f1412",
  canvasSoft: "#161d1a",
  mint50: "#12221c",
  mint100: "#163027",
  mint200: "#1f4a3a",
  hairline: "#232b28",
  hairlineStrong: "#34403b",
  ink: "#f4f7f5",
  body: "#cfd6d2",
  muted: "#97a19c",
  faint: "#5d6762",
  link: "#6fb3ff",
  error: "#ff6b6b",
  errorSurface: "#3a1b1b",
  better: "#3ccf91",
  worse: "#ff6b6b",
};

export const fonts = {
  regular: "Montserrat_400Regular",
  medium: "Montserrat_500Medium",
  semibold: "Montserrat_600SemiBold",
  bold: "Montserrat_700Bold",
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = { control: 2, card: 8, tile: 12, panel: 16, full: 999 };

export const type = {
  display: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 38 },
  h1: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32 },
  h2: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26 },
  h3: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodySm: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  number: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34 },
};

export function usePalette(): Palette {
  return useColorScheme() === "dark" ? dark : light;
}

export function navigationTheme(scheme: "light" | "dark" | null | undefined) {
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;
  const c = scheme === "dark" ? dark : light;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: c.primary,
      background: c.canvas,
      card: c.canvas,
      text: c.ink,
      border: c.hairline,
      notification: c.error,
    },
  };
}
