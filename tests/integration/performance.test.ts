import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CanvasRenderer } from "../../src/renderers/canvas";
import { DEFAULT_SCENES } from "../../src/scenes/defaults";
import { TransitionEngine } from "../../src/transitions";

describe("Phase 8 - Performance & Optimization", () => {
  let mockTarget: any;
  let mockCtx: any;

  beforeEach(() => {
    mockCtx = {
      createLinearGradient: () => ({ addColorStop: vi.fn() }),
      createRadialGradient: () => ({ addColorStop: vi.fn() }),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      resetTransform: vi.fn(),
    };

    mockTarget = {
      style: { position: "static" },
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      getBoundingClientRect: () => ({ width: 1000, height: 800 }),
    };

    (globalThis as any).document = {
      createElement: () => ({
        style: {},
        setAttribute: vi.fn(),
        getContext: () => mockCtx,
        parentNode: null,
      }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      hidden: false,
      body: mockTarget,
    };

    (globalThis as any).window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      innerWidth: 1000,
      innerHeight: 800,
      devicePixelRatio: 1,
    };

    (globalThis as any).getComputedStyle = () => ({ position: "static" });
    (globalThis as any).requestAnimationFrame = vi.fn((cb) => 1);
    (globalThis as any).cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should scale particle counts according to quality setting", () => {
    const lowRenderer = new CanvasRenderer({ quality: "low", animation: false });
    const highRenderer = new CanvasRenderer({ quality: "high", animation: false });

    lowRenderer.mount(mockTarget);
    highRenderer.mount(mockTarget);

    lowRenderer.render(DEFAULT_SCENES["starry-night"]);
    highRenderer.render(DEFAULT_SCENES["starry-night"]);

    // Low quality starry night has 25% particle count of high quality
    expect((lowRenderer as any).stars.length).toBeLessThan((highRenderer as any).stars.length);

    lowRenderer.destroy();
    highRenderer.destroy();
  });

  it("should pause animation frame loop when tab becomes hidden", () => {
    let visibilityCallback: (() => void) | null = null;
    (globalThis as any).document.addEventListener = vi.fn((event, cb) => {
      if (event === "visibilitychange") visibilityCallback = cb;
    });

    const renderer = new CanvasRenderer({ quality: "medium" });
    renderer.mount(mockTarget);
    renderer.render(DEFAULT_SCENES["rainy-day"]);

    // Simulate tab becoming hidden
    (globalThis as any).document.hidden = true;
    if (visibilityCallback) visibilityCallback();

    expect((globalThis as any).cancelAnimationFrame).toHaveBeenCalled();

    // Simulate tab restored
    (globalThis as any).document.hidden = false;
    if (visibilityCallback) visibilityCallback();

    expect((renderer as any).isPaused).toBe(false);

    renderer.destroy();
  });

  it("should set transition duration to zero when prefers-reduced-motion is active", () => {
    vi.stubGlobal("window", {
      matchMedia: vi.fn().mockReturnValue({ matches: true }),
    });

    const transitions = new TransitionEngine({ duration: 3000, respectReducedMotion: true });
    expect(transitions.getEffectiveDuration()).toBe(0);
  });
});
