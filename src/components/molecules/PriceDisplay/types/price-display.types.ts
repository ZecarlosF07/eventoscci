import type { ActivityPricingConfig } from "@/features/activities/types/activity-pricing.types";

export interface PriceDisplayProps extends ActivityPricingConfig {
  initialNow?: number;
  membersOnly?: boolean;
}
