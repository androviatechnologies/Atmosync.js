import { LocationEngine } from "../engines/location";
import { SeasonEngine } from "../engines/season";
import { TimeEngine } from "../engines/time";
import { WeatherEngine } from "../engines/weather";
import {
  AtmosyncEventType,
  AtmosyncOptions,
  EnvironmentState,
  EventCallback,
  RegionalSeasonProfile,
  WeatherData,
  WeatherProvider,
  WeatherState,
} from "../types";

export class Atmosync {
  private options: AtmosyncOptions;
  private timeEngine: TimeEngine;
  private locationEngine: LocationEngine;
  private seasonEngine: SeasonEngine;
  private weatherEngine: WeatherEngine;
  private listeners: Map<AtmosyncEventType, Set<EventCallback>> = new Map();
  private currentScene: string = "default";
  private manualSceneOverride: string | null = null;
  private isRunning: boolean = false;

  private state: EnvironmentState = {
    time: {
      hour: 0,
      minute: 0,
      period: "night",
    },
    weather: {
      condition: "clear",
    },
    location: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    },
    season: {
      name: "unknown",
      profile: "default",
    },
  };

  constructor(options: AtmosyncOptions = {}) {
    this.options = {
      time: { enabled: true, autoUpdate: true, updateInterval: 60000, ...options.time },
      location: { enabled: false, autoDetect: false, ...options.location },
      weather: { enabled: false, provider: "open-meteo", refreshInterval: 900000, ...options.weather },
      season: { enabled: false, region: "auto", ...options.season },
      initialScene: options.initialScene || "default",
    };

    this.timeEngine = new TimeEngine();
    this.locationEngine = new LocationEngine();
    this.seasonEngine = new SeasonEngine(options.season?.customProfiles);
    this.weatherEngine = new WeatherEngine({
      provider: this.options.weather?.provider,
      refreshInterval: this.options.weather?.refreshInterval,
      cacheTtl: this.options.weather?.cacheTtl,
    });
    this.currentScene = this.options.initialScene || "default";
  }

  public on(event: AtmosyncEventType, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public off(event: AtmosyncEventType, callback: EventCallback): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(callback);
    }
  }

  public emit(event: AtmosyncEventType, data: any): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((callback) => {
        try {
          callback(data);
        } catch (err) {
          console.error(`Error in Atmosync "${event}" listener:`, err);
        }
      });
    }
  }

  public async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    // 1. Resolve Location
    if (this.options.location?.enabled) {
      await this.refreshLocation();
    }

    // 2. Resolve Season
    if (this.options.season?.enabled) {
      this.refreshSeason();
    }

    // 3. Resolve Weather
    if (this.options.weather?.enabled && typeof this.state.location.latitude === "number" && typeof this.state.location.longitude === "number") {
      await this.refreshWeather();

      // Start periodic weather refresh
      this.weatherEngine.start(
        this.state.location.latitude,
        this.state.location.longitude,
        this.options.weather.refreshInterval,
        (weatherData) => {
          this.applyWeatherData(weatherData);
          this.evaluateScene();
        }
      );
    }

    // 4. Resolve Time
    if (this.options.time?.enabled) {
      const currentTime = this.timeEngine.getTimeState();
      this.state.time = { ...this.state.time, ...currentTime };

      if (this.options.time.autoUpdate) {
        this.timeEngine.start(this.options.time.updateInterval, (updatedTime) => {
          this.state.time = { ...this.state.time, ...updatedTime };
          this.emit("timeUpdate", updatedTime);
          this.evaluateScene();
        });
      }
    }

    this.evaluateScene();
  }

  public async setLocation(coords: {
    latitude: number;
    longitude: number;
    timezone?: string;
  }): Promise<void> {
    const locationState = await this.locationEngine.getLocation({
      latitude: coords.latitude,
      longitude: coords.longitude,
      timezone: coords.timezone,
    });

    this.state.location = locationState;
    this.emit("locationUpdate", locationState);

    if (this.options.season?.enabled) {
      this.refreshSeason();
    }

    if (this.options.weather?.enabled && this.isRunning) {
      await this.refreshWeather();
    }

    this.evaluateScene();
  }

  public setWeather(weather: Partial<WeatherState>): void {
    this.state.weather = { ...this.state.weather, ...weather };
    this.emit("weatherUpdate", this.state.weather);
    this.evaluateScene();
  }

  public setWeatherProvider(provider: WeatherProvider): void {
    this.weatherEngine.setProvider(provider);
  }

  public setSeasonProfile(profileId: string): void {
    if (!this.options.season) {
      this.options.season = { enabled: true, region: profileId };
    } else {
      this.options.season.enabled = true;
      this.options.season.region = profileId;
    }

    this.refreshSeason();
    this.evaluateScene();
  }

  public registerSeasonProfile(profile: RegionalSeasonProfile): void {
    this.seasonEngine.registerProfile(profile);
  }

  public setScene(sceneName: string): void {
    this.manualSceneOverride = sceneName;
    this.updateScene(sceneName);
  }

  public resetScene(): void {
    this.manualSceneOverride = null;
    this.evaluateScene();
  }

  public getCurrentScene(): string {
    return this.currentScene;
  }

  public getEnvironmentState(): EnvironmentState {
    return { ...this.state };
  }

  public destroy(): void {
    this.isRunning = false;
    this.timeEngine.stop();
    this.weatherEngine.stop();
    this.listeners.clear();
  }

  private async refreshLocation(): Promise<void> {
    try {
      const locationState = await this.locationEngine.getLocation({
        autoDetect: this.options.location?.autoDetect,
        latitude: this.options.location?.latitude,
        longitude: this.options.location?.longitude,
      });

      this.state.location = locationState;
      this.emit("locationUpdate", locationState);
    } catch (err) {
      this.emit("error", err);
    }
  }

  private async refreshWeather(): Promise<void> {
    const { latitude, longitude } = this.state.location;
    if (typeof latitude !== "number" || typeof longitude !== "number") return;

    try {
      const weatherData = await this.weatherEngine.fetchWeather(latitude, longitude);
      this.applyWeatherData(weatherData);
    } catch (err) {
      this.emit("error", err);
    }
  }

  private applyWeatherData(weatherData: WeatherData): void {
    this.state.weather = {
      condition: weatherData.condition,
      temperature: weatherData.temperature,
      cloudCover: weatherData.cloudCover,
      precipitation: weatherData.precipitation,
      weatherCode: weatherData.weatherCode,
      isDay: weatherData.isDay,
      sunrise: weatherData.sunrise,
      sunset: weatherData.sunset,
    };

    if (weatherData.sunrise) {
      this.state.time.sunrise = weatherData.sunrise;
    }
    if (weatherData.sunset) {
      this.state.time.sunset = weatherData.sunset;
    }

    this.emit("weatherUpdate", this.state.weather);
  }

  private refreshSeason(): void {
    const hemisphere = this.state.location.hemisphere || "north";
    const region = this.options.season?.region || "astronomical";

    const seasonState = this.seasonEngine.getSeason(new Date(), hemisphere, region);
    this.state.season = seasonState;
    this.emit("seasonUpdate", seasonState);
  }

  private evaluateScene(): void {
    if (this.manualSceneOverride) {
      this.updateScene(this.manualSceneOverride);
      return;
    }

    const { period } = this.state.time;
    const computedScene = `${period}-${this.state.weather.condition}`;
    this.updateScene(computedScene);
  }

  private updateScene(newScene: string): void {
    if (this.currentScene !== newScene) {
      this.currentScene = newScene;
      this.emit("sceneChange", newScene);
    }
  }
}
