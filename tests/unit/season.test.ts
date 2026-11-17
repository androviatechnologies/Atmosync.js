import { describe, it, expect } from "vitest";
import {
  calculateAstronomicalSeason,
  SeasonEngine,
} from "../../src/engines/season";

describe("SeasonEngine", () => {
  describe("calculateAstronomicalSeason", () => {
    it("should calculate correct northern hemisphere astronomical seasons", () => {
      // Spring: ~Mar 20 - Jun 20
      expect(calculateAstronomicalSeason(new Date(2026, 2, 21), "north")).toBe("spring"); // March 21
      expect(calculateAstronomicalSeason(new Date(2026, 4, 15), "north")).toBe("spring"); // May 15

      // Summer: ~Jun 21 - Sep 21
      expect(calculateAstronomicalSeason(new Date(2026, 6, 1), "north")).toBe("summer"); // July 1
      expect(calculateAstronomicalSeason(new Date(2026, 7, 20), "north")).toBe("summer"); // August 20

      // Autumn: ~Sep 22 - Dec 20
      expect(calculateAstronomicalSeason(new Date(2026, 9, 15), "north")).toBe("autumn"); // October 15
      expect(calculateAstronomicalSeason(new Date(2026, 10, 10), "north")).toBe("autumn"); // November 10

      // Winter: ~Dec 21 - Mar 19
      expect(calculateAstronomicalSeason(new Date(2026, 11, 25), "north")).toBe("winter"); // December 25
      expect(calculateAstronomicalSeason(new Date(2026, 0, 15), "north")).toBe("winter"); // January 15
    });

    it("should invert seasons for southern hemisphere", () => {
      // July is winter in south
      expect(calculateAstronomicalSeason(new Date(2026, 6, 1), "south")).toBe("winter");
      // January is summer in south
      expect(calculateAstronomicalSeason(new Date(2026, 0, 15), "south")).toBe("summer");
      // April is autumn in south
      expect(calculateAstronomicalSeason(new Date(2026, 3, 15), "south")).toBe("autumn");
      // October is spring in south
      expect(calculateAstronomicalSeason(new Date(2026, 9, 15), "south")).toBe("spring");
    });
  });

  describe("Regional Profiles", () => {
    const engine = new SeasonEngine();

    it("should resolve tropical wet and dry seasons", () => {
      // Wet: May (5) to Oct (10)
      const wetDate = new Date(2026, 6, 15); // July
      const wetSeason = engine.getSeason(wetDate, "north", "tropical");
      expect(wetSeason.name).toBe("wet");
      expect(wetSeason.profile).toBe("tropical");

      // Dry: Nov (11) to Apr (4)
      const dryDate = new Date(2026, 0, 15); // January
      const drySeason = engine.getSeason(dryDate, "north", "tropical");
      expect(drySeason.name).toBe("dry");
      expect(drySeason.profile).toBe("tropical");
    });

    it("should resolve Indian Subcontinent regional seasons", () => {
      // Monsoon: June (6) to Sept (9)
      const monsoonDate = new Date(2026, 6, 20); // July
      expect(engine.getSeason(monsoonDate, "north", "indian-subcontinent").name).toBe("monsoon");

      // Post-monsoon: Oct (10) to Nov (11)
      const postMonsoonDate = new Date(2026, 9, 15); // October
      expect(engine.getSeason(postMonsoonDate, "north", "indian-subcontinent").name).toBe("post-monsoon");

      // Winter: Dec (12) to Feb (2)
      const winterDate = new Date(2026, 0, 10); // January
      expect(engine.getSeason(winterDate, "north", "indian-subcontinent").name).toBe("winter");

      // Summer: March (3) to May (5)
      const summerDate = new Date(2026, 3, 10); // April
      expect(engine.getSeason(summerDate, "north", "indian-subcontinent").name).toBe("summer");
    });

    it("should support registering and resolving custom profiles", () => {
      engine.registerProfile({
        id: "polar",
        name: "Polar Day/Night Profile",
        rules: [
          { name: "midnight-sun", startMonth: 4, endMonth: 8 },
          { name: "polar-night", startMonth: 9, endMonth: 3 },
        ],
      });

      const polarSummer = new Date(2026, 5, 1); // June
      expect(engine.getSeason(polarSummer, "north", "polar").name).toBe("midnight-sun");

      const polarWinter = new Date(2026, 11, 1); // December
      expect(engine.getSeason(polarWinter, "north", "polar").name).toBe("polar-night");
    });
  });
});
