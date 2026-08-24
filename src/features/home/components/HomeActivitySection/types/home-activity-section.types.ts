import type { ActivityListItem } from "@/features/activities/types/activity.types";

export interface HomeActivitySectionProps {
  activities: ActivityListItem[];
  description: string;
  href: string;
  title: string;
}
