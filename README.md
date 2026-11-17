# Atmosync.js

> **Dynamically adapt your website's visual atmosphere to local time, weather, location, and regional seasons.**

[![npm version](https://img.shields.io/npm/v/atmosync.svg)](https://www.npmjs.com/package/atmosync)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](#)

Atmosync.js is an ultra-lightweight, framework-agnostic environmental background engine. It turns plain website backgrounds into living atmospheres that seamlessly shift throughout the day—from crisp golden sunrises and sunny afternoons to gentle rain, swirling snow, and star-studded nights—reflecting real-world conditions.

---

## ✨ Features

- ⏱️ **Automatic Time & Diurnal Shifts:** Classifies and transitions through morning, afternoon, evening, and night based on local or simulated time.
- 🌦️ **Weather-Aware (Open-Meteo Integration):** Free, zero-API-key weather data with automatic caching and graceful offline fallback.
- 🌍 **Location & Season Intelligence:** Astronomical seasons with hemisphere inversion (solstices/equinoxes) and regional climate profiles (tropical wet/dry, Indian monsoon).
- 🎨 **Layer-Based Compositing:** Sky gradients, celestial bodies (sun & moon with aura glows), cloud clusters, rain streaks, snow oscillation, and lightning flashes.
- ⚡ **Dual Renderers:**
  - **Canvas 2D Renderer:** High-fidelity particle effects, battery-conscious auto-pause on background tabs, and quality scaling (`high`, `medium`, `low`).
  - **CSS Renderer:** Zero-overhead, lightweight CSS gradients and custom properties.
- ♿ **Accessibility First:** Detects and respects `prefers-reduced-motion` to eliminate motion-induced discomfort.
- 🌈 **Accessible Dynamic Palettes:** Automatically extracts WCAG-compliant UI color palettes and exposes them via CSS custom properties (`--atmosync-bg`, `--atmosync-surface`, `--atmosync-text`, etc.).
- ⚛️ **First-Class React Support:** Clean subpath export (`atmosync/react`) with `<AtmosyncProvider />` and custom hooks (`useAtmosync`, `useScene`, `useWeather`, `useTheme`).

---

## 📦 Installation

```bash
# npm
npm install atmosync

# pnpm
pnpm add atmosync

# yarn
yarn add atmosync
```

---

## 🚀 Quick Start

### 1. Vanilla JavaScript / TypeScript

```ts
import { Atmosync } from "atmosync";

// 1. Initialize Atmosync
const atmosphere = new Atmosync({
  renderer: {
    type: "canvas",    // "canvas" | "css"
    quality: "high",    // "high" | "medium" | "low"
    target: document.body,
  },
  location: {
    enabled: true,
    autoDetect: true,
  },
  weather: {
    enabled: true,
    provider: "open-meteo",
  },
  time: {
    enabled: true,
    autoUpdate: true,
  },
  season: {
    enabled: true,
    region: "auto",
  },
});

// 2. Start the atmosphere engine
await atmosphere.start();

// 3. Listen to reactive updates
atmosphere.on("sceneChange", (scene) => {
  console.log("Current scene:", scene.name, scene.description);
});

atmosphere.on("themeChange", (palette) => {
  console.log("Active theme palette:", palette);
});

// 4. Manual overrides whenever needed
atmosphere.setScene("thunderstorm-night");

// Reset back to automatic environmental detection
atmosphere.resetScene();

// Clean up when leaving page
// atmosphere.destroy();
```

---

### 2. React Integration (`atmosync/react`)

```tsx
import React from "react";
import { AtmosyncProvider, useAtmosync, useScene, useWeather, useTheme } from "atmosync/react";

function AtmosphereControls() {
  const { scene, isReady } = useAtmosync();
  const { setScene, resetScene } = useScene();
  const { weather, setWeather } = useWeather();
  const { theme } = useTheme();

  if (!isReady) return <div>Synchronizing atmosphere...</div>;

  return (
    <div style={{
      background: theme?.surface,
      color: theme?.text,
      padding: "1.5rem",
      borderRadius: "1rem"
    }}>
      <h2>Current Scene: {scene?.name}</h2>
      <p>{scene?.description}</p>

      <button onClick={() => setScene("starry-night")}>Set Starry Night</button>
      <button onClick={() => setScene("rainy-day")}>Set Rainy Day</button>
      <button onClick={resetScene}>Auto Detect</button>
    </div>
  );
}

export default function App() {
  return (
    <AtmosyncProvider
      options={{
        renderer: { type: "canvas", quality: "high" },
        location: { enabled: true, autoDetect: true },
        weather: { enabled: true },
      }}
    >
      <AtmosphereControls />
    </AtmosyncProvider>
  );
}
```

---

## ⚙️ Configuration Options

```ts
const atmosphere = new Atmosync({
  // Time Engine Configuration
  time: {
    enabled: true,             // Enable diurnal cycle detection
    autoUpdate: true,          // Poll time periodically
    updateInterval: 60000,     // 1 minute (ms)
  },

  // Location Engine Configuration
  location: {
    enabled: true,             // Resolve timezone / coordinates
    autoDetect: true,          // Query browser Geolocation API
    latitude: 40.7128,         // Optional manual latitude
    longitude: -74.0060,       // Optional manual longitude
  },

  // Weather Engine Configuration
  weather: {
    enabled: true,             // Enable weather-aware scene changes
    provider: "open-meteo",    // "open-meteo" or custom WeatherProvider instance
    refreshInterval: 900000,   // 15 minutes (ms)
    cacheTtl: 900000,          // 15 minutes cache (ms)
  },

  // Season Engine Configuration
  season: {
    enabled: true,             // Enable seasonal awareness
    region: "auto",            // "auto" | "astronomical" | "tropical" | "indian-subcontinent"
  },

  // Rendering Configuration
  renderer: {
    type: "canvas",            // "canvas" (particles) or "css" (gradients)
    quality: "high",           // "high" | "medium" | "low"
    target: document.body,     // Mount target element or CSS selector
    animation: true,           // Run continuous animation loop
  },

  // Transition & Motion Accessibility
  transitions: {
    enabled: true,
    duration: 1500,            // Duration in ms
    respectReducedMotion: true,// Reduces transition to 0ms when requested by user
  },

  // Theme & CSS Variables
  theme: {
    enabled: true,             // Inject CSS custom properties on target / :root
    target: document.documentElement,
  },

  // Initial Scene Preset
  initialScene: "default",
});
```

---

## 🎨 CSS Custom Properties

When enabled, Atmosync injects the following CSS custom variables, updating dynamically with every scene change:

| CSS Variable | Description |
|---|---|
| `--atmosync-bg` | Background ambient canvas / horizon color |
| `--atmosync-surface` | Translucent frosted surface color for cards, panels, and navbars |
| `--atmosync-text` | High-contrast foreground text color |
| `--atmosync-text-muted` | Accessible secondary muted text color |
| `--atmosync-accent` | Atmospheric accent color (solar gold, lightning yellow, azure) |
| `--atmosync-border` | Subtle semi-transparent border color matching current mood |
| `--atmosync-sky-top` | Hex/RGB color of the top sky layer |
| `--atmosync-sky-bottom` | Hex/RGB color of the bottom sky horizon |
| `--atmosync-brightness` | Relative atmospheric luminosity (0 to 1) |
| `--atmosync-is-night` | `1` during night scenes, `0` during daytime scenes |

---

## 🎭 Predefined Scenes

Atmosync comes with 17 meticulously balanced atmospheric scenes:

- **Daytime:** `sunny-day`, `cloudy-day`, `foggy-day`, `rainy-day`, `snowy-day`, `thunderstorm-day`
- **Morning / Dawn:** `sunrise`
- **Evening / Dusk:** `golden-sunset`, `cloudy-evening`, `rainy-sunset`, `thunderstorm-evening`
- **Night:** `starry-night`, `cloudy-night`, `foggy-night`, `rainy-night`, `snowy-night`, `thunderstorm-night`
- **Fallback:** `default`

---

## 🛠️ API Reference

### Atmosync Instance Methods

- `start(): Promise<void>` — Starts time tracking, resolves location/weather, and mounts the renderer.
- `pause(): void` — Pauses rendering animation loops.
- `resume(): void` — Resumes rendering animation loops.
- `setScene(scene: string | SceneConfig): void` — Overrides the scene manually.
- `resetScene(): void` — Clears manual overrides and returns to automatic environmental detection.
- `setLocation(coords: { latitude, longitude, timezone? }): Promise<void>` — Sets manual coordinates and recalculates season/weather.
- `setWeather(weather: Partial<WeatherState>): void` — Sets manual weather conditions.
- `setWeatherProvider(provider: WeatherProvider): void` — Registers a custom weather data provider.
- `registerSceneRule(rule: SceneRule): void` — Injects a custom priority-based scene rule.
- `registerCustomScene(scene: SceneConfig): void` — Registers a custom scene definition.
- `getCurrentScene(): SceneConfig` — Returns the currently active scene object and visual layers.
- `getEnvironmentState(): EnvironmentState` — Returns the current combined environmental state.
- `getThemePalette(): ThemePalette | null` — Returns the active accessible UI color palette.
- `destroy(): void` — Unbinds all listeners, stops interval timers, cancels animation loops, and cleans up DOM elements.

### Events

Subscribe with `atmosphere.on(event, callback)`:

- `"sceneChange"` `(scene: SceneConfig)` — Emitted when the atmospheric scene changes.
- `"themeChange"` `(palette: ThemePalette)` — Emitted when the UI color palette updates.
- `"weatherUpdate"` `(weather: WeatherState)` — Emitted when weather data is fetched or updated.
- `"timeUpdate"` `(time: TimeState)` — Emitted on time ticks.
- `"locationUpdate"` `(location: LocationState)` — Emitted when coordinates or timezone are resolved.
- `"seasonUpdate"` `(season: SeasonState)` — Emitted when regional season recalculates.
- `"error"` `(error: any)` — Emitted on non-fatal background errors.

---

## 📄 License

MIT © [Atmosync Contributors](LICENSE)
