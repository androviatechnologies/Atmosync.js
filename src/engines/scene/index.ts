import { DEFAULT_SCENES } from "../../scenes/defaults";
import { EnvironmentState, SceneConfig, SceneRule } from "../../types";

export class SceneEngine {
  private rules: SceneRule[] = [];
  private customScenes: Map<string, SceneConfig> = new Map();

  constructor() {
    this.registerDefaultRules();
  }

  public registerRule(rule: SceneRule): void {
    this.rules.push(rule);
    // Sort descending by priority so highest priority runs first
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  public registerCustomScene(scene: SceneConfig): void {
    this.customScenes.set(scene.id, scene);
  }

  public getSceneById(id: string): SceneConfig | undefined {
    return this.customScenes.get(id) || DEFAULT_SCENES[id];
  }

  public evaluate(env: EnvironmentState): SceneConfig {
    for (const rule of this.rules) {
      if (rule.match(env)) {
        return rule.createScene(env);
      }
    }

    return DEFAULT_SCENES.default;
  }

  private registerDefaultRules(): void {
    // Priority 100: Thunderstorm
    this.registerRule({
      id: "rule-thunderstorm",
      priority: 100,
      match: (env) => env.weather.condition === "thunderstorm",
      createScene: (env) => {
        if (env.time.period === "night") return DEFAULT_SCENES["thunderstorm-night"];
        if (env.time.period === "evening") return DEFAULT_SCENES["thunderstorm-evening"];
        return DEFAULT_SCENES["thunderstorm-day"];
      },
    });

    // Priority 80: Snow
    this.registerRule({
      id: "rule-snow",
      priority: 80,
      match: (env) => env.weather.condition === "snow",
      createScene: (env) => {
        if (env.time.period === "night") return DEFAULT_SCENES["snowy-night"];
        return DEFAULT_SCENES["snowy-day"];
      },
    });

    // Priority 70: Rain & Drizzle
    this.registerRule({
      id: "rule-rain",
      priority: 70,
      match: (env) => env.weather.condition === "rain" || env.weather.condition === "drizzle",
      createScene: (env) => {
        if (env.time.period === "night") return DEFAULT_SCENES["rainy-night"];
        if (env.time.period === "evening") return DEFAULT_SCENES["rainy-sunset"];
        return DEFAULT_SCENES["rainy-day"];
      },
    });

    // Priority 60: Fog
    this.registerRule({
      id: "rule-fog",
      priority: 60,
      match: (env) => env.weather.condition === "fog",
      createScene: (env) => {
        if (env.time.period === "night") return DEFAULT_SCENES["foggy-night"];
        return DEFAULT_SCENES["foggy-day"];
      },
    });

    // Priority 50: Sunrise & Golden Sunset (clear / partly cloudy)
    this.registerRule({
      id: "rule-sunset",
      priority: 50,
      match: (env) =>
        env.time.period === "evening" &&
        (env.weather.condition === "clear" || env.weather.condition === "partly-cloudy"),
      createScene: () => DEFAULT_SCENES["golden-sunset"],
    });

    this.registerRule({
      id: "rule-sunrise",
      priority: 50,
      match: (env) =>
        env.time.period === "morning" &&
        (env.weather.condition === "clear" || env.weather.condition === "partly-cloudy"),
      createScene: () => DEFAULT_SCENES["sunrise"],
    });

    // Priority 40: Cloudy / Overcast
    this.registerRule({
      id: "rule-cloudy",
      priority: 40,
      match: (env) => env.weather.condition === "cloudy",
      createScene: (env) => {
        if (env.time.period === "night") return DEFAULT_SCENES["cloudy-night"];
        if (env.time.period === "evening") return DEFAULT_SCENES["cloudy-evening"];
        return DEFAULT_SCENES["cloudy-day"];
      },
    });

    // Priority 20: Clear / Default by Time Period
    this.registerRule({
      id: "rule-night",
      priority: 20,
      match: (env) => env.time.period === "night",
      createScene: () => DEFAULT_SCENES["starry-night"],
    });

    this.registerRule({
      id: "rule-day",
      priority: 20,
      match: (env) => env.time.period === "afternoon",
      createScene: () => DEFAULT_SCENES["sunny-day"],
    });

    this.registerRule({
      id: "rule-morning",
      priority: 20,
      match: (env) => env.time.period === "morning",
      createScene: () => DEFAULT_SCENES["sunrise"],
    });

    this.registerRule({
      id: "rule-evening",
      priority: 20,
      match: (env) => env.time.period === "evening",
      createScene: () => DEFAULT_SCENES["golden-sunset"],
    });
  }
}
