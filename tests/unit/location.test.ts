import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  determineHemisphere,
  detectTimezone,
  LocationEngine,
} from "../../src/engines/location";

describe("LocationEngine", () => {
  describe("determineHemisphere", () => {
    it("should return 'north' for positive latitudes and 0", () => {
      expect(determineHemisphere(40.7128)).toBe("north"); // New York
      expect(determineHemisphere(0)).toBe("north"); // Equator
      expect(determineHemisphere(51.5074)).toBe("north"); // London
    });

    it("should return 'south' for negative latitudes", () => {
      expect(determineHemisphere(-33.8688)).toBe("south"); // Sydney
      expect(determineHemisphere(-22.9068)).toBe("south"); // Rio
    });
  });

  describe("detectTimezone", () => {
    it("should return a valid timezone string", () => {
      const tz = detectTimezone();
      expect(typeof tz).toBe("string");
      expect(tz.length).toBeGreaterThan(0);
    });
  });

  describe("getLocation", () => {
    let engine: LocationEngine;

    beforeEach(() => {
      engine = new LocationEngine();
    });

    it("should return manual coordinates and calculated hemisphere", async () => {
      const location = await engine.getLocation({
        latitude: 13.0827,
        longitude: 80.2707,
        timezone: "Asia/Kolkata",
      });

      expect(location.latitude).toBe(13.0827);
      expect(location.longitude).toBe(80.2707);
      expect(location.hemisphere).toBe("north");
      expect(location.timezone).toBe("Asia/Kolkata");
    });

    it("should fall back gracefully to timezone only when coordinates not provided", async () => {
      const location = await engine.getLocation();
      expect(location.timezone).toBeDefined();
      expect(location.latitude).toBeUndefined();
      expect(location.longitude).toBeUndefined();
      expect(location.hemisphere).toBeUndefined();
    });

    it("should resolve coordinates from browser geolocation when available", async () => {
      const mockGetCurrentPosition = vi.fn((success) => {
        success({
          coords: {
            latitude: -37.8136,
            longitude: 144.9631,
          },
        });
      });

      vi.stubGlobal("navigator", {
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
        },
      });

      const location = await engine.getLocation({ autoDetect: true });

      expect(mockGetCurrentPosition).toHaveBeenCalled();
      expect(location.latitude).toBe(-37.8136);
      expect(location.longitude).toBe(144.9631);
      expect(location.hemisphere).toBe("south");

      vi.unstubAllGlobals();
    });

    it("should fallback to timezone only when browser geolocation rejects", async () => {
      const mockGetCurrentPosition = vi.fn((_, error) => {
        error(new Error("User denied Geolocation"));
      });

      vi.stubGlobal("navigator", {
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
        },
      });

      const location = await engine.getLocation({ autoDetect: true });

      expect(location.timezone).toBeDefined();
      expect(location.latitude).toBeUndefined();
      expect(location.hemisphere).toBeUndefined();

      vi.unstubAllGlobals();
    });
  });
});
