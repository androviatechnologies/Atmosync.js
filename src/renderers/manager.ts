import { Renderer, RendererOptions, SceneConfig } from "../types";
import { CanvasRenderer } from "./canvas";
import { CssRenderer } from "./css";

export class RenderingManager {
  private renderer: Renderer;
  private currentScene: SceneConfig | null = null;
  private target: any = null;

  constructor(options: RendererOptions = {}) {
    const type = options.type || "canvas";

    if (type === "css") {
      this.renderer = new CssRenderer();
    } else {
      this.renderer = new CanvasRenderer({
        quality: options.quality,
        animation: options.animation,
      });
    }

    this.target = options.target || null;
  }

  public mount(target?: any): void {
    if (target) {
      this.target = target;
    }
    this.renderer.mount(this.target);
  }

  public render(scene: SceneConfig): void {
    this.currentScene = scene;
    this.renderer.render(scene);
  }

  public pause(): void {
    this.renderer.pause();
  }

  public resume(): void {
    this.renderer.resume();
  }

  public destroy(): void {
    this.renderer.destroy();
    this.currentScene = null;
    this.target = null;
  }

  public getRenderer(): Renderer {
    return this.renderer;
  }
}
