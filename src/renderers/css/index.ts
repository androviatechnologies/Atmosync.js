import { Renderer, RendererType, SceneConfig } from "../../types";

export class CssRenderer implements Renderer {
  public readonly type: RendererType = "css";
  private container: HTMLElement | null = null;
  private target: HTMLElement | null = null;
  private isPaused: boolean = false;
  private currentScene: SceneConfig | null = null;

  public mount(target: any): void {
    if (typeof document === "undefined") return;

    if (typeof target === "string") {
      this.target = document.querySelector(target) as HTMLElement;
    } else if (target && typeof target === "object" && "appendChild" in target) {
      this.target = target as HTMLElement;
    } else {
      this.target = document.body;
    }

    if (!this.target) return;

    this.container = document.createElement("div");
    this.container.className = "atmosync-css-background";
    this.container.setAttribute("aria-hidden", "true");

    Object.assign(this.container.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      zIndex: "-1",
      pointerEvents: "none",
      transition: "background 1.5s ease-in-out, opacity 1.5s ease-in-out",
      overflow: "hidden",
    });

    // Ensure relative positioning on target if it's static
    if (this.target !== document.body && getComputedStyle(this.target).position === "static") {
      this.target.style.position = "relative";
    }

    this.target.appendChild(this.container);

    if (this.currentScene) {
      this.render(this.currentScene);
    }
  }

  public render(scene: SceneConfig): void {
    this.currentScene = scene;
    if (this.isPaused || !this.container) return;

    const { sky, lighting } = scene.layers;
    const [topColor, bottomColor] = sky.gradient;

    this.container.style.background = `linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)`;
    this.container.style.opacity = `${sky.brightness}`;

    if (this.target) {
      this.target.style.setProperty("--atmosync-sky-top", topColor);
      this.target.style.setProperty("--atmosync-sky-bottom", bottomColor);
      this.target.style.setProperty("--atmosync-brightness", `${sky.brightness}`);
      this.target.style.setProperty("--atmosync-ambient", lighting.ambientColor);
      this.target.style.setProperty("--atmosync-is-night", lighting.isNight ? "1" : "0");
    }
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
    if (this.currentScene) {
      this.render(this.currentScene);
    }
  }

  public destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.target = null;
    this.currentScene = null;
  }

  public getContainer(): HTMLElement | null {
    return this.container;
  }
}
