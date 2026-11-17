import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { determineTimePeriod, TimeEngine } from "../../src/engines/time";

describe("TimeEngine", () => {
  describe("determineTimePeriod", () => {
    it("should classify 05:00 to 11:59 as morning", () => {
      expect(determineTimePeriod(5)).toBe("morning");
      expect(determineTimePeriod(8)).toBe("morning");
      expect(determineTimePeriod(11)).toBe("morning");
    });

    it("should classify 12:00 to 16:59 as afternoon", () => {
      expect(determineTimePeriod(12)).toBe("afternoon");
      expect(determineTimePeriod(14)).toBe("afternoon");
      expect(determineTimePeriod(16)).toBe("afternoon");
    });

    it("should classify 17:00 to 20:59 as evening", () => {
      expect(determineTimePeriod(17)).toBe("evening");
      expect(determineTimePeriod(19)).toBe("evening");
      expect(determineTimePeriod(20)).toBe("evening");
    });

    it("should classify 21:00 to 04:59 as night", () => {
      expect(determineTimePeriod(21)).toBe("night");
      expect(determineTimePeriod(23)).toBe("night");
      expect(determineTimePeriod(0)).toBe("night");
      expect(determineTimePeriod(4)).toBe("night");
    });
  });

  describe("TimeEngine lifecycle", () => {
    let engine: TimeEngine;

    beforeEach(() => {
      vi.useFakeTimers();
      engine = new TimeEngine();
    });

    afterEach(() => {
      engine.stop();
      vi.useRealTimers();
    });

    it("should return valid time state for a specified date", () => {
      const fixedDate = new Date(2026, 10, 17, 14, 30);
      const state = engine.getTimeState(fixedDate);

      expect(state.hour).toBe(14);
      expect(state.minute).toBe(30);
      expect(state.period).toBe("afternoon");
    });

    it("should trigger callback on tick interval", () => {
      const callback = vi.fn();
      engine.start(1000, callback);

      expect(callback).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(2);

      vi.advanceTimersByTime(2000);
      expect(callback).toHaveBeenCalledTimes(4);

      engine.stop();
      vi.advanceTimersByTime(2000);
      expect(callback).toHaveBeenCalledTimes(4);
    });
  });
});
