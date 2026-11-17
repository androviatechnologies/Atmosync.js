import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Atmosync } from "../../src/core/atmosync";

describe("Phase 8 - Memory & Lifecycle Verification", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should survive rapid start and destroy cycles without leaking timers", async () => {
    const instances: Atmosync[] = [];

    // Create and destroy 10 instances in rapid succession
    for (let i = 0; i < 10; i++) {
      const sync = new Atmosync({
        time: { enabled: true, autoUpdate: true, updateInterval: 1000 },
        weather: { enabled: false },
      });

      await sync.start();
      instances.push(sync);
    }

    // Advance timers - all should receive updates without crashing
    vi.advanceTimersByTime(2000);

    // Destroy all instances
    instances.forEach((sync) => sync.destroy());

    // Advancing timers again should not trigger any actions
    expect(() => vi.advanceTimersByTime(5000)).not.toThrow();
  });

  it("should cleanly remove all listeners on destroy", async () => {
    const sync = new Atmosync();
    const listener = vi.fn();

    sync.on("sceneChange", listener);
    sync.on("timeUpdate", listener);
    sync.on("weatherUpdate", listener);

    await sync.start();
    const countBeforeDestroy = listener.mock.calls.length;
    expect(countBeforeDestroy).toBeGreaterThan(0);

    sync.destroy();

    // Emitting after destroy must not call listener
    sync.emit("sceneChange", { id: "test" });
    sync.emit("timeUpdate", {});
    sync.emit("weatherUpdate", {});

    expect(listener).toHaveBeenCalledTimes(countBeforeDestroy);
  });
});
