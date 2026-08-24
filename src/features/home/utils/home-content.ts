import type { ActivityListItem } from "@/features/activities/types/activity.types";
import { getNextActivityDate } from "@/features/activities/utils/activity-formatters";
import type { HomePageContent } from "@/features/home/types/home.types";

const HOME_SECTION_LIMIT = 9;

function selectUpcomingActivities(
  activities: ActivityListItem[],
  now: Date,
): ActivityListItem[] {
  return activities
    .filter((activity) =>
      activity.dates.some((date) => new Date(date.starts_at) >= now),
    )
    .sort((first, second) => {
      const firstDate = getNextActivityDate(first.dates)?.starts_at ?? "9999";
      const secondDate = getNextActivityDate(second.dates)?.starts_at ?? "9999";
      return firstDate.localeCompare(secondDate);
    })
    .slice(0, HOME_SECTION_LIMIT);
}

export function buildHomePageContent(
  events: ActivityListItem[],
  trainings: ActivityListItem[],
  now = new Date(),
): HomePageContent {
  const upcomingEvents = selectUpcomingActivities(events, now);
  const upcomingTrainings = selectUpcomingActivities(trainings, now);
  const featuredActivity = [...upcomingEvents, ...upcomingTrainings]
    .sort((first, second) => {
      const firstDate = getNextActivityDate(first.dates)?.starts_at ?? "9999";
      const secondDate = getNextActivityDate(second.dates)?.starts_at ?? "9999";
      return firstDate.localeCompare(secondDate);
    })[0] ?? null;

  return {
    events: upcomingEvents,
    featuredActivity,
    trainings: upcomingTrainings,
  };
}
