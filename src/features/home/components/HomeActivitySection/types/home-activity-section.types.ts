import type { ActivityListItem } from "@/features/activities/types/activity.types";

export interface HomeActivitySectionProps {
  activities: ActivityListItem[];
  description: string;
  headingLevel?: 1 | 2;
  href: string;
  title: string;
}
