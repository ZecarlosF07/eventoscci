import type { ActivityDateInput } from "@/features/activities/types/activity-form.types";

export interface ActivityDateFieldsProps {
  initialDates: ActivityDateInput[];
}

export interface ActivityDateFieldItem extends ActivityDateInput {
  fieldId: string;
}
