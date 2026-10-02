import type { ActivityPricingFieldsProps } from "@/features/activities/components/ActivityPricingFields/types/activity-pricing-fields.types";

export type ActivityPresaleFieldsProps = Pick<ActivityPricingFieldsProps, "activity" | "errors" | "isFree" | "membersOnly" | "status" | "type">;
