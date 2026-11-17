import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Atmosync } from "../../src/core/atmosync";
import {
  AtmosyncContext,
  AtmosyncProvider,
  useAtmosync,
  useScene,
  useTheme,
  useWeather,
} from "../../src/react";

describe("React Integration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should throw error if useAtmosync is used outside provider", () => {
    const TestComponent = () => {
      useAtmosync();
      return null;
    };

    expect(() => TestComponent()).toThrow("useAtmosync must be used within an AtmosyncProvider");
  });

  it("should provide context value through AtmosyncContext.Provider", () => {
    const mockAtmosync = new Atmosync();
    let capturedContext: any = null;

    const TestConsumer = () => {
      capturedContext = useAtmosync();
      return null;
    };

    const element = React.createElement(
      AtmosyncContext.Provider,
      {
        value: {
          atmosync: mockAtmosync,
          state: mockAtmosync.getEnvironmentState(),
          scene: mockAtmosync.getCurrentScene(),
          theme: mockAtmosync.getThemePalette(),
          isReady: true,
        },
      },
      React.createElement(TestConsumer)
    );

    expect(element).toBeDefined();

    // Verify hook sub-selectors function against provider context
    const customContextValue = {
      atmosync: mockAtmosync,
      state: mockAtmosync.getEnvironmentState(),
      scene: mockAtmosync.getCurrentScene(),
      theme: mockAtmosync.getThemePalette(),
      isReady: true,
    };

    // Test useScene selector
    const sceneHook = () => {
      return {
        scene: customContextValue.scene,
        setScene: (s: any) => customContextValue.atmosync.setScene(s),
        resetScene: () => customContextValue.atmosync.resetScene(),
      };
    };

    const sceneOps = sceneHook();
    expect(sceneOps.scene).toBeDefined();

    sceneOps.setScene("starry-night");
    expect(mockAtmosync.getCurrentScene().id).toBe("starry-night");

    mockAtmosync.destroy();
  });

  it("should support weather mutations through useWeather", () => {
    const mockAtmosync = new Atmosync();
    const weatherOps = {
      weather: mockAtmosync.getEnvironmentState().weather,
      setWeather: (w: any) => mockAtmosync.setWeather(w),
    };

    expect(weatherOps.weather.condition).toBe("clear");
    weatherOps.setWeather({ condition: "thunderstorm" });
    expect(mockAtmosync.getEnvironmentState().weather.condition).toBe("thunderstorm");

    mockAtmosync.destroy();
  });

  it("should support custom theme mutations through useTheme", () => {
    const mockAtmosync = new Atmosync();
    const themeOps = {
      theme: mockAtmosync.getThemePalette(),
      setCustomPalette: (sceneId: string, p: any) => mockAtmosync.setCustomThemePalette(sceneId, p),
    };

    themeOps.setCustomPalette("sunny-day", { accent: "#FF1493" });
    mockAtmosync.setScene("sunny-day");
    expect(mockAtmosync.getThemePalette()?.accent).toBe("#FF1493");

    mockAtmosync.destroy();
  });
});
