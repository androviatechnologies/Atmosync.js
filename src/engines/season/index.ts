import {
  AstronomicalSeason,
  Hemisphere,
  RegionalSeasonProfile,
  SeasonState,
} from "../../types";

export const BUILT_IN_SEASON_PROFILES: Record<string, RegionalSeasonProfile> = {
  tropical: {
    id: "tropical",
    name: "Tropical Wet/Dry Profile",
    rules: [
      { name: "wet", startMonth: 5, endMonth: 10 },
      { name: "dry", startMonth: 11, endMonth: 4 },
    ],
  },
  "indian-subcontinent": {
    id: "indian-subcontinent",
    name: "Indian Subcontinent Regional Profile",
    rules: [
      { name: "winter", startMonth: 12, endMonth: 2 },
      { name: "summer", startMonth: 3, endMonth: 5 },
      { name: "monsoon", startMonth: 6, endMonth: 9 },
      { name: "post-monsoon", startMonth: 10, endMonth: 11 },
    ],
  },
};

/**
 * Calculates the astronomical season based on date and hemisphere.
 */
export function calculateAstronomicalSeason(
  date: Date = new Date(),
  hemisphere: Hemisphere = "north"
): AstronomicalSeason {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  // MDD format for easy numeric comparison (e.g. March 20 is 320)
  const md = month * 100 + day;

  let seasonNorth: AstronomicalSeason;

  if (md >= 320 && md < 621) {
    seasonNorth = "spring";
  } else if (md >= 621 && md < 922) {
    seasonNorth = "summer";
  } else if (md >= 922 && md < 1221) {
    seasonNorth = "autumn";
  } else {
    seasonNorth = "winter";
  }

  if (hemisphere === "south") {
    switch (seasonNorth) {
      case "spring":
        return "autumn";
      case "summer":
        return "winter";
      case "autumn":
        return "spring";
      case "winter":
        return "summer";
    }
  }

  return seasonNorth;
}

export class SeasonEngine {
  private profiles: Map<string, RegionalSeasonProfile> = new Map();

  constructor(customProfiles?: Record<string, RegionalSeasonProfile>) {
    Object.entries(BUILT_IN_SEASON_PROFILES).forEach(([id, profile]) => {
      this.profiles.set(id, profile);
    });

    if (customProfiles) {
      Object.entries(customProfiles).forEach(([id, profile]) => {
        this.profiles.set(id, profile);
      });
    }
  }

  public registerProfile(profile: RegionalSeasonProfile): void {
    this.profiles.set(profile.id, profile);
  }

  public getSeason(
    date: Date = new Date(),
    hemisphere: Hemisphere = "north",
    profileId: string = "astronomical"
  ): SeasonState {
    if (profileId === "astronomical" || profileId === "auto") {
      const seasonName = calculateAstronomicalSeason(date, hemisphere);
      return {
        name: seasonName,
        profile: "astronomical",
      };
    }

    const profile = this.profiles.get(profileId);
    if (!profile) {
      // Fallback to astronomical if profile not recognized
      const seasonName = calculateAstronomicalSeason(date, hemisphere);
      return {
        name: seasonName,
        profile: "astronomical",
      };
    }

    const currentMonth = date.getMonth() + 1; // 1-12

    for (const rule of profile.rules) {
      if (rule.startMonth <= rule.endMonth) {
        if (currentMonth >= rule.startMonth && currentMonth <= rule.endMonth) {
          return { name: rule.name, profile: profile.id };
        }
      } else {
        // Spans across year boundary (e.g. December (12) to February (2))
        if (currentMonth >= rule.startMonth || currentMonth <= rule.endMonth) {
          return { name: rule.name, profile: profile.id };
        }
      }
    }

    return {
      name: "unknown",
      profile: profile.id,
    };
  }
}
