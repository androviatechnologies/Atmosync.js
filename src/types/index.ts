export type TimePeriod = "morning" | "afternoon" | "evening" | "night";

export type Hemisphere = "north" | "south";

export type AstronomicalSeason = "spring" | "summer" | "autumn" | "winter";

export type WeatherCondition =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunderstorm";

export type CelestialBody = "sun" | "moon" | "none";

export type PrecipitationType = "rain" | "snow" | "drizzle" | "none";

export type RendererType = "css" | "canvas";

export type RenderQuality = "low" | "medium" | "high";

export interface SceneLayerConfig {
  sky: {
    gradient: [string, string];
    brightness: number;
  };
  celestial: {
    body: CelestialBody;
    visible: boolean;
  };
  clouds: {
    density: number;
    type: "sparse" | "scattered" | "overcast" | "none";
  };
  precipitation: {
    type: PrecipitationType;
    intensity: number;
  };
  fog: {
    visible: boolean;
    density: number;
  };
  lighting: {
    ambientColor: string;
    isNight: boolean;
  };
}

export interface SceneConfig {
  id: string;
  name: string;
  description: string;
  layers: SceneLayerConfig;
}

export interface SceneRule {
  id: string;
  priority: number;
  match: (env: EnvironmentState) => boolean;
  createScene: (env: EnvironmentState) => SceneConfig;
}

export interface RendererOptions {
  type?: RendererType;
  quality?: RenderQuality;
  target?: any; // HTMLElement or CSS selector string
  animation?: boolean;
  fpsLimit?: number;
}

export interface Renderer {
  readonly type: RendererType;
  mount(target: any): void;
  render(scene: SceneConfig): void;
  pause(): void;
  resume(): void;
  destroy(): void;
}

export interface TimeState {
  hour: number;
  minute: number;
  period: TimePeriod;
  sunrise?: string;
  sunset?: string;
}

export interface WeatherState {
  condition: WeatherCondition;
  temperature?: number;
  cloudCover?: number;
  precipitation?: number;
  weatherCode?: number;
  isDay?: boolean;
  sunrise?: string;
  sunset?: string;
}

export interface WeatherData extends WeatherState {
  timestamp: number;
}

export interface WeatherProvider {
  readonly name: string;
  getWeather(latitude: number, longitude: number): Promise<WeatherData>;
}

export interface LocationState {
  latitude?: number;
  longitude?: number;
  timezone: string;
  hemisphere?: Hemisphere;
}

export interface SeasonState {
  name: string;
  profile: string;
}

export interface SeasonRule {
  name: string;
  startMonth: number;
  endMonth: number;
}

export interface RegionalSeasonProfile {
  id: string;
  name: string;
  rules: SeasonRule[];
}

export interface EnvironmentState {
  time: TimeState;
  weather: WeatherState;
  location: LocationState;
  season: SeasonState;
}

export interface AtmosyncOptions {
  time?: {
    enabled?: boolean;
    autoUpdate?: boolean;
    updateInterval?: number;
  };
  location?: {
    enabled?: boolean;
    autoDetect?: boolean;
    latitude?: number;
    longitude?: number;
  };
  weather?: {
    enabled?: boolean;
    provider?: "open-meteo" | WeatherProvider;
    refreshInterval?: number;
    cacheTtl?: number;
  };
  season?: {
    enabled?: boolean;
    region?: "auto" | "astronomical" | "tropical" | "indian-subcontinent" | string;
    customProfiles?: Record<string, RegionalSeasonProfile>;
  };
  renderer?: RendererOptions;
  initialScene?: string;
}

export type AtmosyncEventType =
  | "sceneChange"
  | "weatherUpdate"
  | "timeUpdate"
  | "locationUpdate"
  | "seasonUpdate"
  | "error";

export type EventCallback<T = any> = (data: T) => void;
