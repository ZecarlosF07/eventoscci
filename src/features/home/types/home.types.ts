import type { ActivityListItem } from "@/features/activities/types/activity.types";

export interface HomePageContent {
  events: ActivityListItem[];
  featuredActivity: ActivityListItem | null;
  trainings: ActivityListItem[];
}
