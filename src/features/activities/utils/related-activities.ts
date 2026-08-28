import type {
  ActivityDetail,
  ActivityListItem,
} from "@/features/activities/types/activity.types";

function getFutureStart(activity: ActivityListItem, now: Date): number | null {
  const timestamps = activity.dates
    .filter((date) => !date.deleted_at)
    .map((date) => new Date(date.starts_at).getTime())
    .filter((timestamp) => timestamp >= now.getTime())
    .sort((first, second) => first - second);

  return timestamps[0] ?? null;
}

function getRelevance(activity: ActivityListItem, current: ActivityDetail): number {
  return (
    (current.category && activity.category?.id === current.category.id ? 4 : 0) +
    (activity.type === current.type ? 2 : 0) +
    (activity.modality === current.modality ? 1 : 0)
  );
}

export function selectRelatedActivities(
  activities: ActivityListItem[],
  current: ActivityDetail,
  now: Date,
  limit = 3,
): ActivityListItem[] {
  return activities
    .map((activity) => ({
      activity,
      relevance: getRelevance(activity, current),
      startsAt: getFutureStart(activity, now),
    }))
    .filter(({ activity, startsAt }) =>
      activity.id !== current.id &&
      activity.status === "published" &&
      !activity.registrations_closed_manually &&
      (!activity.registration_open_at || new Date(activity.registration_open_at) <= now) &&
      (!activity.registration_close_at || new Date(activity.registration_close_at) > now) &&
      startsAt !== null,
    )
    .sort((first, second) =>
      second.relevance - first.relevance ||
      (first.startsAt ?? Number.MAX_SAFE_INTEGER) - (second.startsAt ?? Number.MAX_SAFE_INTEGER),
    )
    .slice(0, limit)
    .map(({ activity }) => activity);
}
