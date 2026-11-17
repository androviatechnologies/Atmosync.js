import { describe, it, expect } from "vitest";
import { mapWmoCodeToCondition } from "../../src/providers/weather/wmo";

describe("WMO Code Mapping", () => {
  it("should map code 0 to clear", () => {
    expect(mapWmoCodeToCondition(0)).toBe("clear");
  });

  it("should map codes 1 and 2 to partly-cloudy", () => {
    expect(mapWmoCodeToCondition(1)).toBe("partly-cloudy");
    expect(mapWmoCodeToCondition(2)).toBe("partly-cloudy");
  });

  it("should map code 3 to cloudy", () => {
    expect(mapWmoCodeToCondition(3)).toBe("cloudy");
  });

  it("should map fog codes 45 and 48", () => {
    expect(mapWmoCodeToCondition(45)).toBe("fog");
    expect(mapWmoCodeToCondition(48)).toBe("fog");
  });

  it("should map drizzle codes", () => {
    expect(mapWmoCodeToCondition(51)).toBe("drizzle");
    expect(mapWmoCodeToCondition(53)).toBe("drizzle");
    expect(mapWmoCodeToCondition(55)).toBe("drizzle");
  });

  it("should map rain codes", () => {
    expect(mapWmoCodeToCondition(61)).toBe("rain");
    expect(mapWmoCodeToCondition(63)).toBe("rain");
    expect(mapWmoCodeToCondition(65)).toBe("rain");
    expect(mapWmoCodeToCondition(80)).toBe("rain");
  });

  it("should map snow codes", () => {
    expect(mapWmoCodeToCondition(71)).toBe("snow");
    expect(mapWmoCodeToCondition(73)).toBe("snow");
    expect(mapWmoCodeToCondition(75)).toBe("snow");
    expect(mapWmoCodeToCondition(85)).toBe("snow");
  });

  it("should map thunderstorm codes", () => {
    expect(mapWmoCodeToCondition(95)).toBe("thunderstorm");
    expect(mapWmoCodeToCondition(96)).toBe("thunderstorm");
    expect(mapWmoCodeToCondition(99)).toBe("thunderstorm");
  });
});
