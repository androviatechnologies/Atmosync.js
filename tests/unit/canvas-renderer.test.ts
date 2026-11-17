import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CanvasRenderer } from "../../src/renderers/canvas";
import { DEFAULT_SCENES } from "../../src/scenes/defaults";

describe("CanvasRenderer", () => {
  let renderer: CanvasRenderer;
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
      appendChild: (child: any) => {
        child.parentNode = mockTarget;
      },
      removeChild: (child: any) => {
        child.parentNode = null;
      },
      getBoundingClientRect: () => ({ width: 800, height: 600 }),
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
      innerWidth: 800,
      innerHeight: 600,
      devicePixelRatio: 1,
    };

    (globalThis as any).getComputedStyle = () => ({ position: "static" });
    (globalThis as any).requestAnimationFrame = vi.fn((cb) => 1);
    (globalThis as any).cancelAnimationFrame = vi.fn();

    renderer = new CanvasRenderer({ quality: "high" });
  });

  afterEach(() => {
    renderer.destroy();
  });

  it("should mount and create canvas element", () => {
    renderer.mount(mockTarget);
    expect(renderer.getCanvas()).toBeDefined();
    expect(renderer.getCanvas()?.className).toBe("atmosync-canvas-background");
  });

  it("should render sky gradient and celestial bodies", () => {
    renderer.mount(mockTarget);
    renderer.render(DEFAULT_SCENES["sunny-day"]);

    expect(mockCtx.fillRect).toHaveBeenCalled();
  });

  it("should pause and cancel animation frame", () => {
    renderer.mount(mockTarget);
    renderer.render(DEFAULT_SCENES["rainy-day"]);

    renderer.pause();
    expect((globalThis as any).cancelAnimationFrame).toHaveBeenCalled();
  });

  it("should clean up canvas and listeners on destroy", () => {
    renderer.mount(mockTarget);
    renderer.destroy();

    expect(renderer.getCanvas()).toBeNull();
    expect((globalThis as any).window.removeEventListener).toHaveBeenCalled();
  });
});
