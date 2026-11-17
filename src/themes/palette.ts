import { SceneConfig, ThemePalette } from "../types";

export const BUILT_IN_PALETTES: Record<string, ThemePalette> = {
  sunrise: {
    background: "#1B2735",
    surface: "rgba(35, 45, 65, 0.85)",
    text: "#FFFFFF",
    textMuted: "#CBD5E0",
    accent: "#FF7E5F",
    border: "rgba(255, 126, 95, 0.25)",
  },
  "sunny-day": {
    background: "#F7FAFC",
    surface: "#FFFFFF",
    text: "#1A202C",
    textMuted: "#4A5568",
    accent: "#1976D2",
    border: "rgba(0, 0, 0, 0.1)",
  },
  "cloudy-day": {
    background: "#EDF2F7",
    surface: "#FFFFFF",
    text: "#2D3748",
    textMuted: "#718096",
    accent: "#4A5568",
    border: "rgba(0, 0, 0, 0.08)",
  },
  "rainy-day": {
    background: "#37474F",
    surface: "rgba(55, 71, 79, 0.9)",
    text: "#FFFFFF",
    textMuted: "#B0BEC5",
    accent: "#64B5F6",
    border: "rgba(255, 255, 255, 0.15)",
  },
  "snowy-day": {
    background: "#F0F4F8",
    surface: "#FFFFFF",
    text: "#102A43",
    textMuted: "#627D98",
    accent: "#0088CC",
    border: "rgba(16, 42, 67, 0.12)",
  },
  "thunderstorm-day": {
    background: "#212121",
    surface: "rgba(33, 33, 33, 0.95)",
    text: "#FFFFFF",
    textMuted: "#9E9E9E",
    accent: "#FFD54F",
    border: "rgba(255, 213, 79, 0.3)",
  },
  "golden-sunset": {
    background: "#2C3E50",
    surface: "rgba(44, 62, 80, 0.88)",
    text: "#FFFFFF",
    textMuted: "#E2E8F0",
    accent: "#FD746C",
    border: "rgba(253, 116, 108, 0.25)",
  },
  "starry-night": {
    background: "#050811",
    surface: "rgba(13, 27, 42, 0.9)",
    text: "#FFFFFF",
    textMuted: "#8D99AE",
    accent: "#64B5F6",
    border: "rgba(255, 255, 255, 0.12)",
  },
  "rainy-night": {
    background: "#000428",
    surface: "rgba(0, 20, 50, 0.9)",
    text: "#FFFFFF",
    textMuted: "#8DA4C4",
    accent: "#4FC3F7",
    border: "rgba(79, 195, 247, 0.2)",
  },
  "thunderstorm-night": {
    background: "#0A0A0A",
    surface: "rgba(20, 20, 20, 0.95)",
    text: "#FFFFFF",
    textMuted: "#757575",
    accent: "#FFEA00",
    border: "rgba(255, 234, 0, 0.3)",
  },
  default: {
    background: "#1E3C72",
    surface: "rgba(30, 60, 114, 0.85)",
    text: "#FFFFFF",
    textMuted: "#CBD5E0",
    accent: "#2A5298",
    border: "rgba(255, 255, 255, 0.15)",
  },
};

export function generatePaletteForScene(
  scene: SceneConfig,
  customPalettes?: Record<string, Partial<ThemePalette>>
): ThemePalette {
  if (customPalettes && customPalettes[scene.id]) {
    const base = BUILT_IN_PALETTES[scene.id] || BUILT_IN_PALETTES.default;
    return { ...base, ...customPalettes[scene.id] };
  }

  if (BUILT_IN_PALETTES[scene.id]) {
    return BUILT_IN_PALETTES[scene.id];
  }

  // Dynamic calculation based on scene brightness & lighting
  const isDark = scene.layers.lighting.isNight || scene.layers.sky.brightness < 0.45;
  const [topColor] = scene.layers.sky.gradient;

  if (isDark) {
    return {
      background: topColor,
      surface: "rgba(25, 30, 45, 0.9)",
      text: "#FFFFFF",
      textMuted: "#A0AEC0",
      accent: scene.layers.lighting.ambientColor,
      border: "rgba(255, 255, 255, 0.12)",
    };
  }

  return {
    background: "#F7FAFC",
    surface: "#FFFFFF",
    text: "#1A202C",
    textMuted: "#718096",
    accent: topColor,
    border: "rgba(0, 0, 0, 0.08)",
  };
}
