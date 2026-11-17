import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenMeteoProvider } from "../../src/providers/weather/open-meteo";

describe("OpenMeteoProvider", () => {
  let provider: OpenMeteoProvider;

  beforeEach(() => {
    provider = new OpenMeteoProvider();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should fetch and parse weather data successfully", async () => {
    const mockResponse = {
      current: {
        temperature_2m: 24.5,
        cloud_cover: 65,
        precipitation: 2.1,
        weather_code: 61, // rain
        is_day: 1,
      },
      daily: {
        sunrise: ["2026-11-17T06:05"],
        sunset: ["2026-11-17T17:45"],
      },
    };

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    }));

    const result = await provider.getWeather(13.0827, 80.2707);

    expect(result.condition).toBe("rain");
    expect(result.temperature).toBe(24.5);
    expect(result.cloudCover).toBe(65);
    expect(result.precipitation).toBe(2.1);
    expect(result.isDay).toBe(true);
    expect(result.sunrise).toBe("2026-11-17T06:05");
    expect(result.sunset).toBe("2026-11-17T17:45");
  });

  it("should throw on non-200 responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
    }));

    await expect(provider.getWeather(0, 0)).rejects.toThrow("Open-Meteo API request failed with status: 429");
  });
});
