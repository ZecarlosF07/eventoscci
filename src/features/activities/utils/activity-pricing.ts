import type { ActivityPriceQuote, ActivityPricingConfig, ActivityPricingRow } from "@/features/activities/types/activity-pricing.types";

const DAY_MS = 86_400_000;

export function getActivityPricingConfig(activity: ActivityPricingRow): ActivityPricingConfig {
  return {
    generalPrice: activity.general_price,
    isFree: activity.is_free,
    memberPrice: activity.member_price,
    presaleEndsAt: activity.presale_ends_at,
    presaleGeneralPrice: activity.presale_general_price,
    presaleMemberPrice: activity.presale_member_price,
    type: activity.type,
  };
}

export function getActivityPrice(pricing: ActivityPricingConfig, audience: "general" | "member", now: number): ActivityPriceQuote {
  const regularAmount = pricing.isFree ? 0 : audience === "member" ? pricing.memberPrice : pricing.generalPrice;
  const presale = audience === "member" ? pricing.presaleMemberPrice : pricing.presaleGeneralPrice;
  const isPresale = !pricing.isFree && pricing.type === "event" && presale != null
    && presale > 0 && presale < regularAmount && Boolean(pricing.presaleEndsAt)
    && now < Date.parse(pricing.presaleEndsAt ?? "");
  return { amount: isPresale ? presale : regularAmount, isPresale, regularAmount };
}

// The stored boundary is exclusive: midnight after the selected day in Lima.
export function presaleDateToTimestamp(date: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const instant = new Date(`${date}T00:00:00-05:00`);
  if (!Number.isFinite(instant.getTime()) || timestampToPresaleDate(new Date(instant.getTime() + DAY_MS).toISOString()) !== date) return null;
  return new Date(instant.getTime() + DAY_MS).toISOString();
}

export function timestampToPresaleDate(timestamp: string | null | undefined): string {
  if (!timestamp) return "";
  const boundary = Date.parse(timestamp);
  if (!Number.isFinite(boundary)) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(boundary - 1);
}

export function formatPresaleDeadline(timestamp: string): string {
  return new Intl.DateTimeFormat("es-PE", { timeZone: "America/Lima", day: "numeric", month: "long" }).format(Date.parse(timestamp) - 1);
}

export function matchesExpectedPrice(expected: number | undefined, actual: number, pricing: ActivityPricingConfig): boolean {
  const configured = pricing.presaleGeneralPrice != null || pricing.presaleMemberPrice != null;
  return expected === undefined ? !configured : Math.round(expected * 100) === Math.round(actual * 100);
}
