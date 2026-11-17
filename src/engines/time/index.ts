import { TimePeriod, TimeState } from "../../types";

export function determineTimePeriod(hour: number): TimePeriod {
  if (hour >= 5 && hour < 12) {
    return "morning";
  }
  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }
  if (hour >= 17 && hour < 21) {
    return "evening";
  }
  return "night";
}

export class TimeEngine {
  private timer: ReturnType<typeof setInterval> | null = null;
  private onUpdateCallback?: (time: TimeState) => void;

  public getTimeState(date: Date = new Date()): TimeState {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const period = determineTimePeriod(hour);

    return {
      hour,
      minute,
      period,
    };
  }

  public start(intervalMs: number = 60000, onUpdate?: (time: TimeState) => void): void {
    this.stop();
    this.onUpdateCallback = onUpdate;

    if (this.onUpdateCallback) {
      this.onUpdateCallback(this.getTimeState());
    }

    this.timer = setInterval(() => {
      if (this.onUpdateCallback) {
        this.onUpdateCallback(this.getTimeState());
      }
    }, intervalMs);
  }

  public stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
