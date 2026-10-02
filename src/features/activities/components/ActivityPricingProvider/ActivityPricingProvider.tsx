"use client";

import { createContext, useContext, useState } from "react";

import { usePricingClock } from "@/features/activities/hooks/use-pricing-clock";
import type { ActivityPricingContextValue, ActivityPricingProviderProps } from "@/features/activities/types/activity-pricing.types";

const PricingContext = createContext<ActivityPricingContextValue | null>(null);

export function ActivityPricingProvider({ children, initialNow, pricing: initialPricing }: ActivityPricingProviderProps) {
  const [override, setOverride] = useState<ActivityPricingContextValue["pricing"] | null>(null);
  const pricing = override ?? initialPricing;
  const now = usePricingClock(pricing.presaleEndsAt, initialNow);
  return <PricingContext.Provider value={{ now, pricing, refreshPricing: setOverride }}>{children}</PricingContext.Provider>;
}

export function useRegistrationPricing() {
  const context = useContext(PricingContext);
  if (!context) throw new Error("El formulario requiere su contexto de precios.");
  return context;
}
