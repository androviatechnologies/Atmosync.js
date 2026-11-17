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
});
