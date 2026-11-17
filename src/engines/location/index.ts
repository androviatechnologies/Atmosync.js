import { Hemisphere, LocationState } from "../../types";

export function determineHemisphere(latitude: number): Hemisphere {
  return latitude >= 0 ? "north" : "south";
}

export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export interface GetLocationOptions {
  autoDetect?: boolean;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export class LocationEngine {
  public async getLocation(options: GetLocationOptions = {}): Promise<LocationState> {
    const timezone = options.timezone || detectTimezone();

    // 1. Manual coordinates supplied
    if (typeof options.latitude === "number" && typeof options.longitude === "number") {
      return {
        latitude: options.latitude,
        longitude: options.longitude,
        timezone,
        hemisphere: determineHemisphere(options.latitude),
      };
    }

    // 2. Browser Geolocation auto-detection
    if (options.autoDetect && typeof navigator !== "undefined" && navigator.geolocation) {
      try {
        const coords = await this.queryBrowserGeolocation();
        return {
          latitude: coords.latitude,
          longitude: coords.longitude,
          timezone,
          hemisphere: determineHemisphere(coords.latitude),
        };
      } catch (err) {
        // Fallback gracefully on permission denied / timeout / error
      }
    }

    // 3. Fallback to timezone only
    return {
      timezone,
    };
  }

  private queryBrowserGeolocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5 min cache
        }
      );
    });
  }
}
