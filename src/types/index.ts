export type TimePeriod = "morning" | "afternoon" | "evening" | "night";

export type Hemisphere = "north" | "south";

export type AstronomicalSeason = "spring" | "summer" | "autumn" | "winter";

export interface TimeState {
  hour: number;
  minute: number;
  period: TimePeriod;
  sunrise?: string;
  sunset?: string;
}

export interface WeatherState {
  condition: string;
  temperature?: number;
  cloudCover?: number;
  precipitation?: number;
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
  /** 1-based month (1 = January, 12 = December) */
  startMonth: number;
  /** 1-based month (1 = January, 12 = December) */
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
    provider?: "open-meteo" | "manual";
    refreshInterval?: number;
  };
  season?: {
    enabled?: boolean;
    region?: "auto" | "astronomical" | "tropical" | "indian-subcontinent" | string;
    customProfiles?: Record<string, RegionalSeasonProfile>;
  };
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
