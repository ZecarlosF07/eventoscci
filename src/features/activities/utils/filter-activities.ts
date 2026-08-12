import type {
  ActivityFilters,
  ActivityListItem,
} from "@/features/activities/types/activity.types";
import { getNextActivityDate } from "@/features/activities/utils/activity-formatters";

function matchesQuery(activity: ActivityListItem, query: string): boolean {
  const searchable = [
    activity.title,
    activity.short_description ?? "",
    activity.category?.name ?? "",
  ]
    .join(" ")
    .toLocaleLowerCase("es-PE");

  return searchable.includes(query.toLocaleLowerCase("es-PE"));
}

function matchesDate(activity: ActivityListItem, date: string): boolean {
  return activity.dates.some((item) => item.starts_at.slice(0, 10) >= date);
}

export function filterAndSortActivities(
  activities: ActivityListItem[],
  filters: ActivityFilters,
): ActivityListItem[] {
  return activities
    .filter((activity) => !filters.query || matchesQuery(activity, filters.query))
    .filter((activity) => !filters.date || matchesDate(activity, filters.date))
    .sort((first, second) => {
      const firstDate = getNextActivityDate(first.dates)?.starts_at ?? "9999";
      const secondDate = getNextActivityDate(second.dates)?.starts_at ?? "9999";
      return firstDate.localeCompare(secondDate);
    });
}
