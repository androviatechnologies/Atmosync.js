import { describe, it, expect, vi, beforeEach } from "vitest";
import { DEFAULT_SCENES } from "../../src/scenes/defaults";
import { ThemeEngine } from "../../src/themes";
import { generatePaletteForScene } from "../../src/themes/palette";

describe("ThemeEngine", () => {
  let engine: ThemeEngine;
  let mockElement: any;
  let cssProps: Record<string, string>;

  beforeEach(() => {
    cssProps = {};
    mockElement = {
      style: {
        setProperty: vi.fn((key: string, val: string) => {
          cssProps[key] = val;
        }),
      },
    };

    engine = new ThemeEngine({ target: mockElement });
  });

  describe("generatePaletteForScene", () => {
    it("should return high-contrast light palette for sunny day", () => {
      const palette = generatePaletteForScene(DEFAULT_SCENES["sunny-day"]);
      expect(palette.text).toBe("#1A202C");
      expect(palette.surface).toBe("#FFFFFF");
      expect(palette.accent).toBe("#1976D2");
    });

    it("should return high-contrast dark palette for starry night", () => {
      const palette = generatePaletteForScene(DEFAULT_SCENES["starry-night"]);
      expect(palette.text).toBe("#FFFFFF");
      expect(palette.background).toBe("#050811");
      expect(palette.border).toContain("rgba(255, 255, 255");
    });

    it("should apply custom palette overrides", () => {
      const palette = generatePaletteForScene(DEFAULT_SCENES["sunny-day"], {
        "sunny-day": { accent: "#FF00AA" },
      });
      expect(palette.accent).toBe("#FF00AA");
      expect(palette.text).toBe("#1A202C"); // kept from base
    });
  });

  describe("ThemeEngine applying properties", () => {
    it("should apply palette as CSS variables to target element", () => {
      const palette = engine.applyTheme(DEFAULT_SCENES["sunny-day"]);
      expect(mockElement.style.setProperty).toHaveBeenCalledWith("--atmosync-bg", palette.background);
      expect(mockElement.style.setProperty).toHaveBeenCalledWith("--atmosync-text", palette.text);
      expect(mockElement.style.setProperty).toHaveBeenCalledWith("--atmosync-accent", palette.accent);
      expect(engine.getCurrentPalette()).toEqual(palette);
    });

    it("should allow runtime custom palette registration", () => {
      engine.setCustomPalette("starry-night", { accent: "#9945FF" });
      const palette = engine.applyTheme(DEFAULT_SCENES["starry-night"]);
      expect(palette.accent).toBe("#9945FF");
      expect(mockElement.style.setProperty).toHaveBeenCalledWith("--atmosync-accent", "#9945FF");
    });
  });
});
