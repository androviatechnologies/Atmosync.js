import { WeatherData, WeatherProvider } from "../../types";
import { mapWmoCodeToCondition } from "./wmo";

export class OpenMeteoProvider implements WeatherProvider {
  public readonly name = "open-meteo";

  public async getWeather(latitude: number, longitude: number): Promise<WeatherData> {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", latitude.toString());
    url.searchParams.set("longitude", longitude.toString());
    url.searchParams.set(
      "current",
      "temperature_2m,cloud_cover,precipitation,weather_code,is_day"
    );
    url.searchParams.set("daily", "sunrise,sunset");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "1");

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `Open-Meteo API request failed with status: ${response.status} (${response.statusText})`
      );
    }

    const data = await response.json();

    const currentWeather = data.current || {};
    const dailyWeather = data.daily || {};

    const weatherCode = typeof currentWeather.weather_code === "number" ? currentWeather.weather_code : 0;
    const condition = mapWmoCodeToCondition(weatherCode);

    return {
      condition,
      temperature: currentWeather.temperature_2m,
      cloudCover: currentWeather.cloud_cover,
      precipitation: currentWeather.precipitation,
      weatherCode,
      isDay: currentWeather.is_day === 1,
      sunrise: Array.isArray(dailyWeather.sunrise) ? dailyWeather.sunrise[0] : undefined,
      sunset: Array.isArray(dailyWeather.sunset) ? dailyWeather.sunset[0] : undefined,
      timestamp: Date.now(),
    };
  }
}
