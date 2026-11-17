import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { CssRenderer } from "../../src/renderers/css";
import { DEFAULT_SCENES } from "../../src/scenes/defaults";

describe("CssRenderer", () => {
  let renderer: CssRenderer;
  let mockTarget: any;

  beforeEach(() => {
    renderer = new CssRenderer();

    const styles: Record<string, string> = {};
    mockTarget = {
      style: {
        position: "static",
        setProperty: (key: string, val: string) => {
          styles[key] = val;
        },
      },
      appendChild: (child: any) => {
        child.parentNode = mockTarget;
      },
      removeChild: (child: any) => {
        child.parentNode = null;
      },
      getBoundingClientRect: () => ({ width: 1000, height: 800 }),
    };

    // Stub global document and window if needed
    if (typeof (globalThis as any).document === "undefined") {
      (globalThis as any).document = {
        createElement: (tag: string) => ({
          tagName: tag,
          className: "",
          style: {},
          setAttribute: () => {},
          parentNode: null,
        }),
        body: mockTarget,
      };
      (globalThis as any).getComputedStyle = () => ({ position: "static" });
    }
  });

  afterEach(() => {
    renderer.destroy();
  });

  it("should mount and create background element", () => {
    renderer.mount(mockTarget);
    expect(renderer.getContainer()).toBeDefined();
    expect(renderer.getContainer()?.className).toBe("atmosync-css-background");
  });

  it("should render gradient and CSS variables", () => {
    renderer.mount(mockTarget);
    const sunny = DEFAULT_SCENES["sunny-day"];
    renderer.render(sunny);

    const container = renderer.getContainer();
    expect(container?.style.background).toContain("linear-gradient");
  });

  it("should pause and resume rendering updates", () => {
    renderer.mount(mockTarget);
    renderer.render(DEFAULT_SCENES["sunny-day"]);

    renderer.pause();
    renderer.render(DEFAULT_SCENES["starry-night"]);
    // Should still have previous background because it was paused
    expect(renderer.getContainer()?.style.background).toContain(DEFAULT_SCENES["sunny-day"].layers.sky.gradient[0]);

    renderer.resume();
    // After resuming, should update to starry-night
    expect(renderer.getContainer()?.style.background).toContain(DEFAULT_SCENES["starry-night"].layers.sky.gradient[0]);
  });

  it("should clean up element on destroy", () => {
    renderer.mount(mockTarget);
    expect(renderer.getContainer()).toBeDefined();

    renderer.destroy();
    expect(renderer.getContainer()).toBeNull();
  });
});
