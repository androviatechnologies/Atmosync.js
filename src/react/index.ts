import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Atmosync } from "../core/atmosync";
import {
  AtmosyncOptions,
  EnvironmentState,
  SceneConfig,
  ThemePalette,
  WeatherState,
} from "../types";

export interface AtmosyncContextValue {
  atmosync: Atmosync | null;
  state: EnvironmentState | null;
  scene: SceneConfig | null;
  theme: ThemePalette | null;
  isReady: boolean;
}

export const AtmosyncContext = createContext<AtmosyncContextValue>({
  atmosync: null,
  state: null,
  scene: null,
  theme: null,
  isReady: false,
});

export interface AtmosyncProviderProps {
  options?: AtmosyncOptions;
  instance?: Atmosync;
  children: React.ReactNode;
}

export const AtmosyncProvider: React.FC<AtmosyncProviderProps> = ({
  options,
  instance,
  children,
}) => {
  const [atmosyncInstance, setAtmosyncInstance] = useState<Atmosync | null>(() => {
    return instance || new Atmosync(options);
  });

  const [state, setState] = useState<EnvironmentState | null>(() => {
    return atmosyncInstance ? atmosyncInstance.getEnvironmentState() : null;
  });

  const [scene, setScene] = useState<SceneConfig | null>(() => {
    return atmosyncInstance ? atmosyncInstance.getCurrentScene() : null;
  });

  const [theme, setTheme] = useState<ThemePalette | null>(() => {
    return atmosyncInstance ? atmosyncInstance.getThemePalette() : null;
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const active = instance || atmosyncInstance || new Atmosync(options);
    if (!atmosyncInstance) {
      setAtmosyncInstance(active);
    }

    const onScene = (newScene: SceneConfig) => setScene(newScene);
    const onTheme = (newTheme: ThemePalette) => setTheme(newTheme);
    const onTime = () => setState(active.getEnvironmentState());
    const onWeather = () => setState(active.getEnvironmentState());
    const onLocation = () => setState(active.getEnvironmentState());
    const onSeason = () => setState(active.getEnvironmentState());

    active.on("sceneChange", onScene);
    active.on("themeChange", onTheme);
    active.on("timeUpdate", onTime);
    active.on("weatherUpdate", onWeather);
    active.on("locationUpdate", onLocation);
    active.on("seasonUpdate", onSeason);

    active.start().then(() => {
      setState(active.getEnvironmentState());
      setScene(active.getCurrentScene());
      setTheme(active.getThemePalette());
      setIsReady(true);
    });

    return () => {
      active.off("sceneChange", onScene);
      active.off("themeChange", onTheme);
      active.off("timeUpdate", onTime);
      active.off("weatherUpdate", onWeather);
      active.off("locationUpdate", onLocation);
      active.off("seasonUpdate", onSeason);

      // Only destroy if internally instantiated
      if (!instance) {
        active.destroy();
      }
    };
  }, [instance, options]);

  const value = useMemo<AtmosyncContextValue>(() => ({
    atmosync: atmosyncInstance,
    state,
    scene,
    theme,
    isReady,
  }), [atmosyncInstance, state, scene, theme, isReady]);

  return React.createElement(AtmosyncContext.Provider, { value }, children);
};

export function useAtmosync(): AtmosyncContextValue {
  let context: AtmosyncContextValue | null = null;
  try {
    context = useContext(AtmosyncContext);
  } catch {
    throw new Error("useAtmosync must be used within an AtmosyncProvider");
  }

  if (!context || !context.atmosync) {
    throw new Error("useAtmosync must be used within an AtmosyncProvider");
  }
  return context;
}

export function useScene(): {
  scene: SceneConfig | null;
  setScene: (scene: string | SceneConfig) => void;
  resetScene: () => void;
} {
  const { atmosync, scene } = useAtmosync();
  return {
    scene,
    setScene: (s) => atmosync?.setScene(s),
    resetScene: () => atmosync?.resetScene(),
  };
}

export function useWeather(): {
  weather: WeatherState | null;
  setWeather: (weather: Partial<WeatherState>) => void;
} {
  const { atmosync, state } = useAtmosync();
  return {
    weather: state ? state.weather : null,
    setWeather: (w) => atmosync?.setWeather(w),
  };
}

export function useTheme(): {
  theme: ThemePalette | null;
  setCustomPalette: (sceneId: string, palette: Partial<ThemePalette>) => void;
} {
  const { atmosync, theme } = useAtmosync();
  return {
    theme,
    setCustomPalette: (sceneId, p) => atmosync?.setCustomThemePalette(sceneId, p),
  };
}
