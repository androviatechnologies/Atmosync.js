import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CanvasRenderer } from "../../src/renderers/canvas";
import { CssRenderer } from "../../src/renderers/css";
import { RenderingManager } from "../../src/renderers/manager";
import { DEFAULT_SCENES } from "../../src/scenes/defaults";

describe("RenderingManager", () => {
  it("should create CanvasRenderer by default", () => {
    const manager = new RenderingManager();
    expect(manager.getRenderer()).toBeInstanceOf(CanvasRenderer);
    expect(manager.getRenderer().type).toBe("canvas");
    manager.destroy();
  });

  it("should create CssRenderer when requested", () => {
    const manager = new RenderingManager({ type: "css" });
    expect(manager.getRenderer()).toBeInstanceOf(CssRenderer);
    expect(manager.getRenderer().type).toBe("css");
    manager.destroy();
  });

  it("should delegate render, pause, resume, and destroy", () => {
    const manager = new RenderingManager({ type: "css" });
    const renderer = manager.getRenderer();

    const renderSpy = vi.spyOn(renderer, "render");
    const pauseSpy = vi.spyOn(renderer, "pause");
    const resumeSpy = vi.spyOn(renderer, "resume");
    const destroySpy = vi.spyOn(renderer, "destroy");

    manager.render(DEFAULT_SCENES["sunny-day"]);
    expect(renderSpy).toHaveBeenCalledWith(DEFAULT_SCENES["sunny-day"]);

    manager.pause();
    expect(pauseSpy).toHaveBeenCalled();

    manager.resume();
    expect(resumeSpy).toHaveBeenCalled();

    manager.destroy();
    expect(destroySpy).toHaveBeenCalled();
  });
});
