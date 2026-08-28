import type { CountdownParts } from "@/features/registrations/types/registration-countdown.types";

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function getCountdownParts(
  deadlineTimestamp: number,
  nowTimestamp: number,
): CountdownParts | null {
  const remaining = deadlineTimestamp - nowTimestamp;
  if (remaining <= 0) return null;

  return {
    days: Math.floor(remaining / DAY),
    hours: Math.floor((remaining % DAY) / HOUR),
    minutes: Math.floor((remaining % HOUR) / MINUTE),
    seconds: Math.floor((remaining % MINUTE) / SECOND),
  };
}
