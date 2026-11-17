import { describe, it, expect, beforeEach } from "vitest";
import { SceneEngine } from "../../src/engines/scene";
import { EnvironmentState, SceneConfig } from "../../src/types";

describe("SceneEngine", () => {
  let engine: SceneEngine;
  let baseEnv: EnvironmentState;

  beforeEach(() => {
    engine = new SceneEngine();
    baseEnv = {
      time: { hour: 14, minute: 0, period: "afternoon" },
      weather: { condition: "clear" },
      location: { timezone: "UTC" },
      season: { name: "summer", profile: "astronomical" },
    };
  });

  it("should evaluate clear afternoon as sunny-day", () => {
    const scene = engine.evaluate(baseEnv);
    expect(scene.id).toBe("sunny-day");
    expect(scene.layers.celestial.body).toBe("sun");
    expect(scene.layers.precipitation.type).toBe("none");
  });

  it("should evaluate clear morning as sunrise", () => {
    baseEnv.time.period = "morning";
    baseEnv.time.hour = 7;
    const scene = engine.evaluate(baseEnv);
    expect(scene.id).toBe("sunrise");
    expect(scene.layers.celestial.body).toBe("sun");
  });

  it("should evaluate clear evening as golden-sunset", () => {
    baseEnv.time.period = "evening";
    baseEnv.time.hour = 18;
    const scene = engine.evaluate(baseEnv);
    expect(scene.id).toBe("golden-sunset");
  });

  it("should evaluate clear night as starry-night", () => {
    baseEnv.time.period = "night";
    baseEnv.time.hour = 23;
    const scene = engine.evaluate(baseEnv);
    expect(scene.id).toBe("starry-night");
    expect(scene.layers.celestial.body).toBe("moon");
    expect(scene.layers.lighting.isNight).toBe(true);
  });

  it("should prioritize thunderstorm over time of day", () => {
    baseEnv.weather.condition = "thunderstorm";

    // Day thunderstorm
    expect(engine.evaluate(baseEnv).id).toBe("thunderstorm-day");

    // Night thunderstorm
    baseEnv.time.period = "night";
    expect(engine.evaluate(baseEnv).id).toBe("thunderstorm-night");

    // Evening thunderstorm
    baseEnv.time.period = "evening";
    expect(engine.evaluate(baseEnv).id).toBe("thunderstorm-evening");
  });

  it("should prioritize precipitation over standard cloudiness", () => {
    baseEnv.weather.condition = "rain";
    const rainy = engine.evaluate(baseEnv);
    expect(rainy.id).toBe("rainy-day");
    expect(rainy.layers.precipitation.type).toBe("rain");
    expect(rainy.layers.precipitation.intensity).toBeGreaterThan(0);

    baseEnv.weather.condition = "snow";
    const snowy = engine.evaluate(baseEnv);
    expect(snowy.id).toBe("snowy-day");
    expect(snowy.layers.precipitation.type).toBe("snow");
  });

  it("should evaluate fog correctly", () => {
    baseEnv.weather.condition = "fog";
    const fog = engine.evaluate(baseEnv);
    expect(fog.id).toBe("foggy-day");
    expect(fog.layers.fog.visible).toBe(true);
  });

  it("should allow registering custom scenes and higher-priority rules", () => {
    const customAuroraScene: SceneConfig = {
      id: "aurora-borealis",
      name: "Aurora Borealis",
      description: "Luminescent northern lights dance across the polar sky",
      layers: {
        sky: { gradient: ["#000B18", "#00FFA3"], brightness: 0.4 },
        celestial: { body: "none", visible: false },
        clouds: { density: 0, type: "none" },
        precipitation: { type: "none", intensity: 0 },
        fog: { visible: false, density: 0 },
        lighting: { ambientColor: "#00FFA3", isNight: true },
      },
    };

    engine.registerCustomScene(customAuroraScene);
    expect(engine.getSceneById("aurora-borealis")).toBe(customAuroraScene);

    // Register high-priority rule matching high-latitude winter nights
    engine.registerRule({
      id: "rule-aurora",
      priority: 200, // higher than thunderstorm
      match: (env) =>
        env.time.period === "night" &&
        env.weather.condition === "clear" &&
        env.season.name === "winter",
      createScene: () => customAuroraScene,
    });

    baseEnv.time.period = "night";
    baseEnv.weather.condition = "clear";
    baseEnv.season.name = "winter";

    const scene = engine.evaluate(baseEnv);
    expect(scene.id).toBe("aurora-borealis");
    expect(scene.name).toBe("Aurora Borealis");
  });
});
