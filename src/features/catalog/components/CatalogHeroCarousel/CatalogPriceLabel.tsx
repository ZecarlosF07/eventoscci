"use client";

import { usePricingClock } from "@/features/activities/hooks/use-pricing-clock";
import type { CatalogPriceLabelProps } from "@/features/catalog/components/CatalogHeroCarousel/types/catalog-hero-carousel.types";
import { getCatalogPriceLabel } from "@/features/catalog/utils/catalog-price-label";

export function CatalogPriceLabel({ activityPricing, membersOnly = false, priceLabel, pricingInitialNow }: CatalogPriceLabelProps) {
  const now = usePricingClock(activityPricing?.presaleEndsAt, pricingInitialNow);
  return activityPricing ? getCatalogPriceLabel(activityPricing, membersOnly, now) : priceLabel;
}
