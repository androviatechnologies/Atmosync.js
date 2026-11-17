import { TimeEngine } from "../engines/time";
import {
  AtmosyncEventType,
  AtmosyncOptions,
  EnvironmentState,
  EventCallback,
} from "../types";

export class Atmosync {
  private options: AtmosyncOptions;
  private timeEngine: TimeEngine;
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

    // Initialize time
    if (this.options.time?.enabled) {
      const currentTime = this.timeEngine.getTimeState();
      this.state.time = currentTime;

      if (this.options.time.autoUpdate) {
        this.timeEngine.start(this.options.time.updateInterval, (updatedTime) => {
          this.state.time = updatedTime;
          this.emit("timeUpdate", updatedTime);
          this.evaluateScene();
        });
      }
    }

    this.evaluateScene();
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
    this.listeners.clear();
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
