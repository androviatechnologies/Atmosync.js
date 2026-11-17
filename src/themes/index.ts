import { SceneConfig, ThemeOptions, ThemePalette } from "../types";
import { generatePaletteForScene } from "./palette";

export class ThemeEngine {
  private target: any = null;
  private customPalettes: Record<string, Partial<ThemePalette>> = {};
  private currentPalette: ThemePalette | null = null;
  private isEnabled: boolean;

  constructor(options: ThemeOptions = {}) {
    this.isEnabled = options.enabled !== false;
    this.target = options.target || null;
    this.customPalettes = options.customPalettes || {};
  }

  public setTarget(target: any): void {
    this.target = target;
    if (this.currentPalette) {
      this.applyPalette(this.currentPalette);
    }
  }

  public setCustomPalette(sceneId: string, palette: Partial<ThemePalette>): void {
    this.customPalettes[sceneId] = {
      ...this.customPalettes[sceneId],
      ...palette,
    };
  }

  public applyTheme(scene: SceneConfig): ThemePalette {
    const palette = generatePaletteForScene(scene, this.customPalettes);
    this.currentPalette = palette;

    if (this.isEnabled) {
      this.applyPalette(palette);
    }

    return palette;
  }

  public getCurrentPalette(): ThemePalette | null {
    return this.currentPalette;
  }

  private applyPalette(palette: ThemePalette): void {
    let targetElement: any = null;

    if (this.target && typeof this.target === "object" && "style" in this.target) {
      targetElement = this.target;
    } else if (typeof document !== "undefined") {
      if (typeof this.target === "string") {
        targetElement = document.querySelector(this.target);
      } else {
        targetElement = document.documentElement;
      }
    }

    if (!targetElement || !targetElement.style || typeof targetElement.style.setProperty !== "function") {
      return;
    }

    targetElement.style.setProperty("--atmosync-bg", palette.background);
    targetElement.style.setProperty("--atmosync-surface", palette.surface);
    targetElement.style.setProperty("--atmosync-text", palette.text);
    targetElement.style.setProperty("--atmosync-text-muted", palette.textMuted);
    targetElement.style.setProperty("--atmosync-accent", palette.accent);
    targetElement.style.setProperty("--atmosync-border", palette.border);
  }
}
