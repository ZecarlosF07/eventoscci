import type { ActivityFilters } from "@/features/activities/types/activity.types";
import type { ActivityListItem } from "@/features/activities/types/activity.types";

export interface ActivitiesListTemplateProps {
  activities: ActivityListItem[];
  categories: Array<{ id: string; name: string }>;
  description: string;
  emptyMessage: string;
  eyebrow: string;
  filters: ActivityFilters;
  title: string;
}
