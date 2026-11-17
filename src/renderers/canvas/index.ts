import {
  RenderQuality,
  Renderer,
  RendererType,
  SceneConfig,
} from "../../types";

interface StarParticle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
}

interface RainParticle {
  x: number;
  y: number;
  length: number;
  speed: number;
}

interface SnowParticle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  swing: number;
  swingSpeed: number;
}

export interface CanvasRendererOptions {
  quality?: RenderQuality;
  animation?: boolean;
}

export class CanvasRenderer implements Renderer {
  public readonly type: RendererType = "canvas";
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private target: HTMLElement | null = null;
  private quality: RenderQuality;
  private isAnimated: boolean;
  private isPaused: boolean = false;
  private animFrameId: number | null = null;
  private currentScene: SceneConfig | null = null;

  private stars: StarParticle[] = [];
  private rain: RainParticle[] = [];
  private snow: SnowParticle[] = [];
  private lightningAlpha: number = 0;
  private width: number = 800;
  private height: number = 600;

  private resizeHandler = () => this.resize();
  private visibilityHandler = () => {
    if (typeof document !== "undefined") {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    }
  };

  constructor(options: CanvasRendererOptions = {}) {
    this.quality = options.quality || "high";
    this.isAnimated = options.animation !== false;
  }

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

    this.canvas = document.createElement("canvas");
    this.canvas.className = "atmosync-canvas-background";
    this.canvas.setAttribute("aria-hidden", "true");

    Object.assign(this.canvas.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      zIndex: "-1",
      pointerEvents: "none",
    });

    if (this.target !== document.body && getComputedStyle(this.target).position === "static") {
      this.target.style.position = "relative";
    }

    this.target.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    this.resize();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.resizeHandler);
      document.addEventListener("visibilitychange", this.visibilityHandler);
    }

    if (this.currentScene) {
      this.render(this.currentScene);
    }
  }

  public render(scene: SceneConfig): void {
    this.currentScene = scene;
    this.initParticles();
    this.draw();

    if (!this.isPaused && this.isAnimated && !this.animFrameId) {
      this.startLoop();
    }
  }

  public pause(): void {
    this.isPaused = true;
    if (this.animFrameId !== null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public resume(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    if (this.isAnimated && this.currentScene) {
      this.startLoop();
    }
  }

  public destroy(): void {
    this.pause();

    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.resizeHandler);
      document.removeEventListener("visibilitychange", this.visibilityHandler);
    }

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.canvas = null;
    this.ctx = null;
    this.target = null;
    this.currentScene = null;
    this.stars = [];
    this.rain = [];
    this.snow = [];
  }

  public getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  private resize(): void {
    if (!this.canvas || !this.target) return;

    const rect = this.target.getBoundingClientRect();
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    this.width = rect.width || (typeof window !== "undefined" ? window.innerWidth : 800);
    this.height = rect.height || (typeof window !== "undefined" ? window.innerHeight : 600);

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;

    if (this.ctx) {
      this.ctx.resetTransform?.();
      this.ctx.scale(dpr, dpr);
    }

    this.initParticles();
    this.draw();
  }

  private initParticles(): void {
    if (!this.currentScene) return;

    const countMultiplier = this.quality === "high" ? 1.0 : this.quality === "medium" ? 0.5 : 0.25;
    const { precipitation, lighting } = this.currentScene.layers;

    // Stars (if night)
    if (lighting.isNight) {
      const starCount = Math.floor(100 * countMultiplier);
      this.stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * this.width,
        y: Math.random() * this.height * 0.7,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        speed: Math.random() * 0.02 + 0.005,
      }));
    } else {
      this.stars = [];
    }

    // Rain
    if (precipitation.type === "rain" || precipitation.type === "drizzle") {
      const baseRainCount = precipitation.type === "rain" ? 160 : 60;
      const rainCount = Math.floor(baseRainCount * precipitation.intensity * countMultiplier);
      this.rain = Array.from({ length: rainCount }, () => ({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        length: Math.random() * 15 + 10,
        speed: Math.random() * 10 + 15,
      }));
    } else {
      this.rain = [];
    }

    // Snow
    if (precipitation.type === "snow") {
      const snowCount = Math.floor(90 * precipitation.intensity * countMultiplier);
      this.snow = Array.from({ length: snowCount }, () => ({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2.5 + 1,
        speed: Math.random() * 1.5 + 0.8,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.03 + 0.01,
      }));
    } else {
      this.snow = [];
    }
  }

  private startLoop(): void {
    if (typeof requestAnimationFrame === "undefined") return;

    const loop = () => {
      if (this.isPaused) return;
      this.draw();
      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  private draw(): void {
    if (!this.ctx || !this.currentScene) return;

    const { width, height } = this;
    const { sky, celestial, clouds, fog } = this.currentScene.layers;

    // 1. Draw Sky Gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, sky.gradient[0]);
    gradient.addColorStop(1, sky.gradient[1]);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    // 2. Draw Stars
    if (this.stars.length > 0) {
      this.ctx.fillStyle = "#FFFFFF";
      for (const star of this.stars) {
        star.alpha += star.speed;
        const currentAlpha = Math.abs(Math.sin(star.alpha));
        this.ctx.globalAlpha = currentAlpha;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.globalAlpha = 1.0;
    }

    // 3. Draw Celestial Body (Sun or Moon)
    if (celestial.visible && celestial.body !== "none") {
      const cx = width * 0.75;
      const cy = height * 0.25;
      const radius = 32;

      this.ctx.save();
      const glow = this.ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 2.5);

      if (celestial.body === "sun") {
        glow.addColorStop(0, "rgba(255, 220, 100, 0.9)");
        glow.addColorStop(0.5, "rgba(255, 180, 50, 0.4)");
        glow.addColorStop(1, "rgba(255, 150, 0, 0)");
      } else {
        glow.addColorStop(0, "rgba(240, 245, 255, 0.9)");
        glow.addColorStop(0.5, "rgba(200, 220, 255, 0.3)");
        glow.addColorStop(1, "rgba(180, 200, 255, 0)");
      }

      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, radius * 2.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 4. Draw Clouds
    if (clouds.density > 0 && clouds.type !== "none") {
      this.ctx.save();
      const cloudAlpha = clouds.density * 0.35;
      this.ctx.fillStyle = `rgba(255, 255, 255, ${cloudAlpha})`;

      // Draw soft cloud shapes
      const cloudY = height * 0.2;
      this.ctx.beginPath();
      this.ctx.arc(width * 0.3, cloudY, 50, 0, Math.PI * 2);
      this.ctx.arc(width * 0.35, cloudY - 20, 60, 0, Math.PI * 2);
      this.ctx.arc(width * 0.42, cloudY, 50, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 5. Draw Fog
    if (fog.visible && fog.density > 0) {
      this.ctx.save();
      this.ctx.fillStyle = `rgba(230, 235, 240, ${fog.density * 0.35})`;
      this.ctx.fillRect(0, 0, width, height);
      this.ctx.restore();
    }

    // 6. Draw Rain
    if (this.rain.length > 0) {
      this.ctx.strokeStyle = "rgba(180, 205, 235, 0.6)";
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();

      for (const drop of this.rain) {
        this.ctx.moveTo(drop.x, drop.y);
        this.ctx.lineTo(drop.x - 2, drop.y + drop.length);

        drop.y += drop.speed;
        drop.x -= 1;

        if (drop.y > height) {
          drop.y = -drop.length;
          drop.x = Math.random() * width;
        }
      }

      this.ctx.stroke();
    }

    // 7. Draw Snow
    if (this.snow.length > 0) {
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      this.ctx.beginPath();

      for (const flake of this.snow) {
        flake.swing += flake.swingSpeed;
        flake.x += Math.sin(flake.swing) * 0.8;
        flake.y += flake.speed;

        if (flake.y > height) {
          flake.y = -flake.radius;
          flake.x = Math.random() * width;
        }

        this.ctx.moveTo(flake.x, flake.y);
        this.ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      }

      this.ctx.fill();
    }

    // 8. Lightning Flash for Thunderstorms
    if (this.currentScene.layers.precipitation.intensity >= 0.9) {
      if (Math.random() < 0.008) {
        this.lightningAlpha = 0.85;
      }

      if (this.lightningAlpha > 0) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningAlpha})`;
        this.ctx.fillRect(0, 0, width, height);
        this.lightningAlpha -= 0.08;
      }
    }
  }
}
