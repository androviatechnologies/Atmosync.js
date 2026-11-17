import { WeatherCondition } from "../../types";

/**
 * Maps WMO (World Meteorological Organization) weather interpretation codes to normalized conditions.
 * Reference: https://open-meteo.com/en/docs
 */
export function mapWmoCodeToCondition(code: number): WeatherCondition {
  switch (code) {
    case 0:
      return "clear";
    case 1:
    case 2:
      return "partly-cloudy";
    case 3:
      return "cloudy";
    case 45:
    case 48:
      return "fog";
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return "drizzle";
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return "rain";
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return "snow";
    case 95:
    case 96:
    case 99:
      return "thunderstorm";
    default:
      if (code > 0 && code < 40) return "partly-cloudy";
      if (code >= 50 && code < 70) return "rain";
      if (code >= 70 && code < 80) return "snow";
      if (code >= 90) return "thunderstorm";
      return "clear";
  }
}
