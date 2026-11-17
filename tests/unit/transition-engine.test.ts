import { describe, it, expect, vi, afterEach } from "vitest";
import { TransitionEngine } from "../../src/transitions";

describe("TransitionEngine", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should return standard configured duration when reduced motion is off", () => {
    vi.stubGlobal("window", {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    });

    const engine = new TransitionEngine({ duration: 2000, easing: "ease-out" });
    expect(engine.getEffectiveDuration()).toBe(2000);
    expect(engine.getEasing()).toBe("ease-out");
    expect(engine.isReducedMotionPreferred()).toBe(false);
  });

  it("should return 0 duration when prefers-reduced-motion is active", () => {
    vi.stubGlobal("window", {
      matchMedia: vi.fn().mockReturnValue({ matches: true }),
    });

    const engine = new TransitionEngine({ duration: 2000, respectReducedMotion: true });
    expect(engine.isReducedMotionPreferred()).toBe(true);
    expect(engine.getEffectiveDuration()).toBe(0);
  });

  it("should return 0 duration when transitions are explicitly disabled", () => {
    const engine = new TransitionEngine({ enabled: false, duration: 1500 });
    expect(engine.getEffectiveDuration()).toBe(0);
  });
});
