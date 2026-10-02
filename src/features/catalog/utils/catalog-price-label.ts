import type { ActivityPricingConfig } from "@/features/activities/types/activity-pricing.types";
import { formatActivityPrice } from "@/features/activities/utils/activity-formatters";
import { getActivityPrice } from "@/features/activities/utils/activity-pricing";

export function getCatalogPriceLabel(pricing: ActivityPricingConfig, membersOnly: boolean, now: number): string {
  if (pricing.isFree) return "Participación gratuita";
  const quote = getActivityPrice(pricing, membersOnly ? "member" : "general", now);
  const audience = membersOnly ? "Precio para asociados" : "Precio general";
  return `${audience} ${formatActivityPrice(quote.amount)}${quote.isPresale ? " · Preventa" : ""}`;
}
