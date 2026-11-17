import { TransitionOptions } from "../types";

export class TransitionEngine {
  private duration: number;
  private easing: string;
  private respectReducedMotion: boolean;
  private isEnabled: boolean;

  constructor(options: TransitionOptions = {}) {
    this.isEnabled = options.enabled !== false;
    this.duration = typeof options.duration === "number" ? options.duration : 1500;
    this.easing = options.easing || "ease-in-out";
    this.respectReducedMotion = options.respectReducedMotion !== false;
  }

  public isReducedMotionPreferred(): boolean {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }

    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  }

  public getEffectiveDuration(): number {
    if (!this.isEnabled) {
      return 0;
    }

    if (this.respectReducedMotion && this.isReducedMotionPreferred()) {
      return 0;
    }

    return this.duration;
  }

  public getEasing(): string {
    return this.easing;
  }

  public setDuration(duration: number): void {
    this.duration = duration;
  }

  public setEasing(easing: string): void {
    this.easing = easing;
  }
}
