import type { ActivityListItem } from "@/features/activities/types/activity.types";

export interface ActivityCardProps {
  activity: ActivityListItem;
  presentation?: "default" | "visual" | "featured";
}
