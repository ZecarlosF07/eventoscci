"use client";

import { ActivityParticipationPrices } from "@/features/activities/components/ActivityParticipationPrices/ActivityParticipationPrices";
import { useRegistrationPricing } from "@/features/activities/components/ActivityPricingProvider/ActivityPricingProvider";

import type { RegistrationParticipationPricesProps } from "@/features/activities/types/activity-pricing.types";

export function RegistrationParticipationPrices({ membersOnly }: RegistrationParticipationPricesProps) {
  const { now, pricing } = useRegistrationPricing();
  return <ActivityParticipationPrices initialNow={now} membersOnly={membersOnly} pricing={pricing} />;
}
