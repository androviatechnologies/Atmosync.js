import { OpenMeteoProvider } from "../../providers/weather/open-meteo";
import { WeatherData, WeatherProvider, WeatherState } from "../../types";

export interface WeatherEngineOptions {
  provider?: WeatherProvider | "open-meteo";
  refreshInterval?: number;
  cacheTtl?: number;
}

export class WeatherEngine {
  private provider: WeatherProvider;
  private cacheTtl: number;
  private cachedData: WeatherData | null = null;
  private cachedCoordinates: { latitude: number; longitude: number } | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private onUpdateCallback?: (weather: WeatherData) => void;

  constructor(options: WeatherEngineOptions = {}) {
    if (!options.provider || options.provider === "open-meteo") {
      this.provider = new OpenMeteoProvider();
    } else {
      this.provider = options.provider;
    }

    this.cacheTtl = options.cacheTtl ?? 15 * 60 * 1000; // 15 minutes default
  }

  public getProvider(): WeatherProvider {
    return this.provider;
  }

  public setProvider(provider: WeatherProvider): void {
    this.provider = provider;
    this.cachedData = null; // Invalidate cache on provider switch
  }

  public isCacheValid(latitude: number, longitude: number): boolean {
    if (!this.cachedData || !this.cachedCoordinates) {
      return false;
    }

    const isSameLocation =
      Math.abs(this.cachedCoordinates.latitude - latitude) < 0.01 &&
      Math.abs(this.cachedCoordinates.longitude - longitude) < 0.01;

    const isNotExpired = Date.now() - this.cachedData.timestamp < this.cacheTtl;

    return isSameLocation && isNotExpired;
  }

  public async fetchWeather(
    latitude: number,
    longitude: number
  ): Promise<WeatherData> {
    if (this.isCacheValid(latitude, longitude) && this.cachedData) {
      return this.cachedData;
    }

    try {
      const freshData = await this.provider.getWeather(latitude, longitude);
      this.cachedData = freshData;
      this.cachedCoordinates = { latitude, longitude };
      return freshData;
    } catch (error) {
      // Offline / network failure fallback: return last known cached data if available
      if (this.cachedData) {
        return this.cachedData;
      }

      // Safe fallback if no prior cache exists
      const fallback: WeatherData = {
        condition: "clear",
        timestamp: Date.now(),
      };
      return fallback;
    }
  }

  public start(
    latitude: number,
    longitude: number,
    intervalMs: number = 15 * 60 * 1000,
    onUpdate?: (weather: WeatherData) => void
  ): void {
    this.stop();
    this.onUpdateCallback = onUpdate;

    // Immediately fetch initial weather
    this.fetchWeather(latitude, longitude).then((data) => {
      if (this.onUpdateCallback) {
        this.onUpdateCallback(data);
      }
    });

    this.timer = setInterval(async () => {
      const data = await this.fetchWeather(latitude, longitude);
      if (this.onUpdateCallback) {
        this.onUpdateCallback(data);
      }
    }, intervalMs);
  }

  public stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public clearCache(): void {
    this.cachedData = null;
    this.cachedCoordinates = null;
  }

  public getLastKnownWeather(): WeatherState | null {
    return this.cachedData;
  }
}
