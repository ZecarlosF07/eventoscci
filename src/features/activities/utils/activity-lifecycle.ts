import { PUBLIC_ACTIVITY_HISTORY_DAYS } from "@/features/activities/constants/activity.constants";
import type { ActivityDateRow, ActivityListItem } from "@/features/activities/types/activity.types";

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1_000;

export function getActivityEndTimestamp(dates: ActivityDateRow[]): number | null {
  const timestamps = dates
    .filter((date) => !date.deleted_at)
    .map((date) => new Date(date.ends_at ?? date.starts_at).getTime())
    .filter(Number.isFinite);

  return timestamps.length ? Math.max(...timestamps) : null;
}

export function hasActivityEnded(dates: ActivityDateRow[], now = new Date()): boolean {
  const endsAt = getActivityEndTimestamp(dates);
  return endsAt !== null && endsAt <= now.getTime();
}

export function getPublicActivityHistoryCutoff(now = new Date()): Date {
  return new Date(now.getTime() - PUBLIC_ACTIVITY_HISTORY_DAYS * DAY_IN_MILLISECONDS);
}

export function isActivityWithinPublicWindow(
  dates: ActivityDateRow[],
  now = new Date(),
): boolean {
  const endsAt = getActivityEndTimestamp(dates);
  return endsAt !== null && endsAt > getPublicActivityHistoryCutoff(now).getTime();
}

export function canActivityInviteRegistration(
  activity: Pick<
    ActivityListItem,
    | "dates"
    | "registration_close_at"
    | "registration_open_at"
    | "registrations_closed_manually"
    | "status"
  >,
  now = new Date(),
): boolean {
  const timestamp = now.getTime();
  return (
    activity.status === "published"
    && !activity.registrations_closed_manually
    && !hasActivityEnded(activity.dates, now)
    && (!activity.registration_open_at || new Date(activity.registration_open_at).getTime() <= timestamp)
    && (!activity.registration_close_at || new Date(activity.registration_close_at).getTime() >= timestamp)
  );
}
