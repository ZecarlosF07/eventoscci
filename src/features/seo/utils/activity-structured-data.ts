import { SITE_CONFIG } from "@/config/site";
import { getActivityPrice, getActivityPricingConfig } from "@/features/activities/utils/activity-pricing";
import { canActivityInviteRegistration } from "@/features/activities/utils/activity-lifecycle";
import type { ActivityStructuredDataInput, JsonLdObject } from "@/features/seo/types/seo.types";
import { toLimaDateTime } from "@/features/seo/utils/seo-date";

export function getActivityLocation(input: ActivityStructuredDataInput): JsonLdObject | JsonLdObject[] | undefined {
  const { activity, pageUrl } = input;
  const venueName = activity.venue?.name || activity.location_name;
  const streetAddress = activity.venue?.address || activity.address;
  const place = venueName || streetAddress ? {
    "@type": "Place",
    address: streetAddress ? {
      "@type": "PostalAddress",
      addressCountry: SITE_CONFIG.address.countryCode,
      addressLocality: SITE_CONFIG.address.locality,
      addressRegion: SITE_CONFIG.address.region,
      streetAddress,
    } : undefined,
    name: venueName || undefined,
  } : undefined;
  const virtualLocation = { "@type": "VirtualLocation", url: pageUrl };
  if (activity.modality === "virtual") return virtualLocation;
  if (activity.modality === "hybrid") return place ? [place, virtualLocation] : virtualLocation;
  return place;
}

export function getActivityOffer(input: ActivityStructuredDataInput): JsonLdObject | undefined {
  const { activity, availability, pageUrl } = input;
  const now = input.now ?? Date.now();
  if (!canActivityInviteRegistration(activity, new Date(now))) return undefined;
  if (availability && !availability.is_open && availability.reason !== "full") return undefined;
  const quote = getActivityPrice(getActivityPricingConfig(activity), activity.members_only ? "member" : "general", now);
  return {
    "@type": "Offer",
    availability: availability?.reason === "full" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    price: quote.amount,
    priceCurrency: "PEN",
    url: pageUrl,
    validFrom: toLimaDateTime(activity.registration_open_at || activity.published_at),
    validThrough: quote.isPresale ? toLimaDateTime(new Date(Date.parse(activity.presale_ends_at ?? "") - 1).toISOString()) : undefined,
  };
}

export function getActivityStatus(status: ActivityStructuredDataInput["activity"]["status"]): string | undefined {
  if (status === "cancelled") return "https://schema.org/EventCancelled";
  // Schema.org has no EventCompleted value. Past dates describe completed events.
  return status === "finished" ? undefined : "https://schema.org/EventScheduled";
}
