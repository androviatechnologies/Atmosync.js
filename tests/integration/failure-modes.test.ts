import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Atmosync } from "../../src/core/atmosync";
import { OpenMeteoProvider } from "../../src/providers/weather/open-meteo";

describe("Phase 8 - Failure Modes & Resiliency", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("should operate smoothly when weather provider encounters network drop or 500", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network connection dropped")));

    const sync = new Atmosync({
      location: { enabled: true, latitude: 12.9716, longitude: 77.5946 },
      weather: { enabled: true, provider: new OpenMeteoProvider() },
    });

    // Starting must not throw unhandled rejection
    await expect(sync.start()).resolves.not.toThrow();

    // Must still evaluate a valid scene based on time & season fallback
    const scene = sync.getCurrentScene();
    expect(scene).toBeDefined();
    expect(scene.id).toBeDefined();

    sync.destroy();
  });

  it("should handle HTTP 429 Rate Limiting from weather API gracefully", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: "Rate Limit Exceeded",
    }));

    const errorListener = vi.fn();
    const sync = new Atmosync({
      location: { enabled: true, latitude: 51.5074, longitude: -0.1278 },
      weather: { enabled: true, provider: new OpenMeteoProvider() },
    });
    sync.on("error", errorListener);

    await sync.start();

    // Verify engine continues running and falls back to safe default weather
    expect(sync.getEnvironmentState().weather.condition).toBe("clear");
    expect(sync.getCurrentScene().id).toMatch(/^(sunrise|sunny-day|golden-sunset|starry-night)$/);

    sync.destroy();
  });

  it("should handle denied geolocation permission without throwing", async () => {
    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: vi.fn((_, error) => {
          error(new Error("User denied Geolocation"));
        }),
      },
    });

    const sync = new Atmosync({
      location: { enabled: true, autoDetect: true },
    });

    await expect(sync.start()).resolves.not.toThrow();

    const state = sync.getEnvironmentState();
    expect(state.location.timezone).toBeDefined();
    expect(state.location.latitude).toBeUndefined();

    sync.destroy();
  });

  it("should execute complete lifecycle in non-DOM / SSR environment", async () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("document", undefined);
    vi.stubGlobal("navigator", undefined);

    const sync = new Atmosync({
      location: { enabled: true, latitude: 48.8566, longitude: 2.3522 },
      season: { enabled: true },
      time: { enabled: true },
    });

    await sync.start();

    expect(sync.getCurrentScene().id).toBeDefined();
    expect(sync.getEnvironmentState().season.name).toBeDefined();

    sync.setScene("rainy-night");
    expect(sync.getCurrentScene().id).toBe("rainy-night");

    sync.resetScene();
    expect(sync.getCurrentScene().id).toBeDefined();

    sync.destroy();
  });
});
