import type { ActivityModality } from "@/features/activities/types/activity.types";

export interface ActivityVirtualAccessFieldsProps {
  defaultValue?: string | null;
  error?: string;
  modality: ActivityModality;
  published: boolean;
}
