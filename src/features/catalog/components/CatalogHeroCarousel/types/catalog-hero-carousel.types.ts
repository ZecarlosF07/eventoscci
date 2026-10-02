import type { ActivityPricingConfig } from "@/features/activities/types/activity-pricing.types";

export interface CatalogCarouselSlide {
  activityPricing?: ActivityPricingConfig;
  artworkVariant?: "commercial";
  badge: string;
  ctaLabel: string;
  kindLabel: string;
  priceLabel: string;
  pricingInitialNow?: number;
  membersOnly?: boolean;
  bannerUrl: string | null;
  description: string | null;
  href: string;
  id: string;
  meta: string | null;
  title: string;
  visualMode: "banner" | "feature";
}

export type CatalogPriceLabelProps = Pick<CatalogCarouselSlide, "activityPricing" | "membersOnly" | "priceLabel" | "pricingInitialNow">;

export interface CatalogHeroCarouselProps {
  browseLabel: string;
  description: string;
  emptyMessage: string;
  eyebrow: string;
  slides: CatalogCarouselSlide[];
  title: string;
}
