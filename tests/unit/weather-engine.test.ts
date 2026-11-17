import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WeatherEngine } from "../../src/engines/weather";
import { WeatherData, WeatherProvider } from "../../src/types";

describe("WeatherEngine", () => {
  let engine: WeatherEngine;
  let mockProvider: WeatherProvider;

  beforeEach(() => {
    vi.useFakeTimers();

    mockProvider = {
      name: "mock-provider",
      getWeather: vi.fn().mockResolvedValue({
        condition: "partly-cloudy",
        temperature: 20,
        cloudCover: 40,
        timestamp: Date.now(),
      } as WeatherData),
    };

    engine = new WeatherEngine({ provider: mockProvider, cacheTtl: 60000 });
  });

  afterEach(() => {
    engine.stop();
    vi.useRealTimers();
  });

  it("should fetch weather from provider and cache it", async () => {
    const data1 = await engine.fetchWeather(10, 20);
    expect(data1.condition).toBe("partly-cloudy");
    expect(mockProvider.getWeather).toHaveBeenCalledTimes(1);

    // Call again within cache TTL
    const data2 = await engine.fetchWeather(10, 20);
    expect(data2).toBe(data1);
    expect(mockProvider.getWeather).toHaveBeenCalledTimes(1);
  });

  it("should re-fetch after cache expires", async () => {
    await engine.fetchWeather(10, 20);
    expect(mockProvider.getWeather).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(61000); // Beyond 60s TTL

    await engine.fetchWeather(10, 20);
    expect(mockProvider.getWeather).toHaveBeenCalledTimes(2);
  });

  it("should re-fetch when coordinates change", async () => {
    await engine.fetchWeather(10, 20);
    expect(mockProvider.getWeather).toHaveBeenCalledTimes(1);

    await engine.fetchWeather(50, 60);
    expect(mockProvider.getWeather).toHaveBeenCalledTimes(2);
  });

  it("should return last cached data if provider throws", async () => {
    await engine.fetchWeather(10, 20);

    // Now make provider fail
    (mockProvider.getWeather as any).mockRejectedValueOnce(new Error("Network Down"));

    vi.advanceTimersByTime(70000); // Expire cache

    const fallbackData = await engine.fetchWeather(10, 20);
    expect(fallbackData.condition).toBe("partly-cloudy");
  });

  it("should return safe fallback object if provider throws and no cache exists", async () => {
    (mockProvider.getWeather as any).mockRejectedValueOnce(new Error("Network Down"));

    const fallbackData = await engine.fetchWeather(10, 20);
    expect(fallbackData.condition).toBe("clear");
  });

  it("should start periodic polling", async () => {
    const onUpdate = vi.fn();
    engine.start(10, 20, 1000, onUpdate);

    // flush microtasks for the immediate fetch
    await vi.advanceTimersByTimeAsync(0);
    expect(onUpdate).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1000);
    expect(onUpdate).toHaveBeenCalledTimes(2);

    engine.stop();
    await vi.advanceTimersByTimeAsync(2000);
    expect(onUpdate).toHaveBeenCalledTimes(2);
  });
});
