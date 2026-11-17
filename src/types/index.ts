export type TimePeriod = "morning" | "afternoon" | "evening" | "night";

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
  hemisphere?: "north" | "south";
}

export interface SeasonState {
  name: string;
  profile: string;
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
    region?: "auto" | string;
  };
  initialScene?: string;
}

export type AtmosyncEventType = "sceneChange" | "weatherUpdate" | "timeUpdate" | "error";

export type EventCallback<T = any> = (data: T) => void;
