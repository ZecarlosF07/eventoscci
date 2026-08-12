import type { ActivityFilters } from "@/features/activities/types/activity.types";

export interface ActivityFiltersProps {
  categories: Array<{ id: string; name: string }>;
  filters: ActivityFilters;
}
