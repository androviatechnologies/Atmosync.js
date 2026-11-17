import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Atmosync } from "../../src/core/atmosync";

describe("Atmosync", () => {
  let atmosync: Atmosync;

  beforeEach(() => {
    vi.useFakeTimers();
    atmosync = new Atmosync();
  });

  afterEach(() => {
    atmosync.destroy();
    vi.useRealTimers();
  });

  it("should initialize with default scene", () => {
    expect(atmosync.getCurrentScene()).toBe("default");
  });

  it("should update scene and emit sceneChange on start", async () => {
    const sceneListener = vi.fn();
    atmosync.on("sceneChange", sceneListener);

    await atmosync.start();

    expect(sceneListener).toHaveBeenCalledTimes(1);
    expect(atmosync.getCurrentScene()).toMatch(/^(morning|afternoon|evening|night)-clear$/);
  });

  it("should support manual scene override and reset", async () => {
    await atmosync.start();

    const sceneListener = vi.fn();
    atmosync.on("sceneChange", sceneListener);

    atmosync.setScene("stormy-night");
    expect(atmosync.getCurrentScene()).toBe("stormy-night");
    expect(sceneListener).toHaveBeenCalledWith("stormy-night");

    atmosync.resetScene();
    expect(atmosync.getCurrentScene()).toMatch(/^(morning|afternoon|evening|night)-clear$/);
  });

  it("should remove event listeners with off()", () => {
    const listener = vi.fn();
    atmosync.on("sceneChange", listener);
    atmosync.off("sceneChange", listener);

    atmosync.emit("sceneChange", "test-scene");
    expect(listener).not.toHaveBeenCalled();
  });

  it("should clean up timers and listeners on destroy()", async () => {
    await atmosync.start();

    const listener = vi.fn();
    atmosync.on("sceneChange", listener);

    atmosync.destroy();
    atmosync.emit("sceneChange", "another-scene");

    expect(listener).not.toHaveBeenCalled();
  });

  it("should support location and season configuration on start", async () => {
    const sync = new Atmosync({
      location: {
        enabled: true,
        latitude: -33.8688,
        longitude: 151.2093, // Sydney
      },
      season: {
        enabled: true,
        region: "astronomical",
      },
    });

    const locationListener = vi.fn();
    const seasonListener = vi.fn();

    sync.on("locationUpdate", locationListener);
    sync.on("seasonUpdate", seasonListener);

    await sync.start();

    expect(locationListener).toHaveBeenCalledTimes(1);
    expect(seasonListener).toHaveBeenCalledTimes(1);

    const state = sync.getEnvironmentState();
    expect(state.location.latitude).toBe(-33.8688);
    expect(state.location.hemisphere).toBe("south");
    expect(state.season.profile).toBe("astronomical");

    sync.destroy();
  });

  it("should update location dynamically and emit locationUpdate", async () => {
    const sync = new Atmosync({
      season: { enabled: true, region: "tropical" },
    });

    const locationListener = vi.fn();
    sync.on("locationUpdate", locationListener);

    await sync.setLocation({ latitude: 1.3521, longitude: 103.8198 }); // Singapore

    expect(locationListener).toHaveBeenCalled();
    const state = sync.getEnvironmentState();
    expect(state.location.hemisphere).toBe("north");
    expect(state.season.profile).toBe("tropical");

    sync.destroy();
  });

  it("should update regional season profile dynamically", async () => {
    const sync = new Atmosync();
    await sync.start();

    const seasonListener = vi.fn();
    sync.on("seasonUpdate", seasonListener);

    sync.setSeasonProfile("indian-subcontinent");

    expect(seasonListener).toHaveBeenCalled();
    expect(sync.getEnvironmentState().season.profile).toBe("indian-subcontinent");

    sync.destroy();
  });
});
