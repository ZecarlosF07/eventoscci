import { SITE_CONFIG } from "@/config/site";
import type {
  ActivityStructuredDataInput,
  BreadcrumbItem,
  CourseListStructuredDataInput,
  CourseStructuredDataInput,
  JsonLdObject,
} from "@/features/seo/types/seo.types";
import { getPublicCourseRoute } from "@/features/courses/utils/course-routes";
import { toLimaDateTime } from "@/features/seo/utils/seo-date";
import { absoluteUrl } from "@/features/seo/utils/seo-url";
import { buildSeoDescription } from "@/features/seo/utils/seo-text";

const ORGANIZATION_ID_PATH = "/#organizacion";
const WEBSITE_ID_PATH = "/#sitio-web";

export function serializeJsonLd(data: JsonLdObject | JsonLdObject[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildOrganizationJsonLd(siteUrl: string): JsonLdObject {
  return {
    "@id": absoluteUrl(ORGANIZATION_ID_PATH, siteUrl),
    "@type": "Organization",
    address: {
      "@type": "PostalAddress",
      addressCountry: SITE_CONFIG.address.countryCode,
      addressLocality: SITE_CONFIG.address.locality,
      addressRegion: SITE_CONFIG.address.region,
      streetAddress: SITE_CONFIG.address.street,
    },
    email: SITE_CONFIG.email,
    logo: absoluteUrl("/icon.webp", siteUrl),
    name: SITE_CONFIG.organization,
    sameAs: SITE_CONFIG.socialLinks,
    telephone: SITE_CONFIG.phone,
    url: siteUrl,
  };
}

export function buildWebsiteJsonLd(siteUrl: string): JsonLdObject {
  return {
    "@id": absoluteUrl(WEBSITE_ID_PATH, siteUrl),
    "@type": "WebSite",
    inLanguage: SITE_CONFIG.language,
    name: SITE_CONFIG.name,
    publisher: { "@id": absoluteUrl(ORGANIZATION_ID_PATH, siteUrl) },
    url: siteUrl,
  };
}

export function buildHomeJsonLd(siteUrl: string): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@graph": [buildOrganizationJsonLd(siteUrl), buildWebsiteJsonLd(siteUrl)],
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[], siteUrl: string): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(item.path, siteUrl),
      name: item.name,
      position: index + 1,
    })),
  };
}

function getActivityLocation(input: ActivityStructuredDataInput): JsonLdObject | JsonLdObject[] {
  const { activity, pageUrl } = input;
  const venueName = activity.venue?.name || activity.location_name || SITE_CONFIG.organization;
  const streetAddress = activity.venue?.address || activity.address || SITE_CONFIG.address.street;
  const place = {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressCountry: SITE_CONFIG.address.countryCode,
      addressLocality: SITE_CONFIG.address.locality,
      addressRegion: SITE_CONFIG.address.region,
      streetAddress,
    },
    name: venueName,
  };
  const virtualLocation = { "@type": "VirtualLocation", url: pageUrl };
  if (activity.modality === "virtual") return virtualLocation;
  if (activity.modality === "hybrid") return [place, virtualLocation];
  return place;
}

function getActivityStatus(status: ActivityStructuredDataInput["activity"]["status"]): string {
  if (status === "cancelled") return "https://schema.org/EventCancelled";
  if (status === "finished") return "https://schema.org/EventCompleted";
  return "https://schema.org/EventScheduled";
}

export function buildActivityJsonLd(input: ActivityStructuredDataInput): JsonLdObject {
  const { activity, image, pageUrl } = input;
  const dates = activity.dates.filter((date) => !date.deleted_at)
    .sort((first, second) => first.starts_at.localeCompare(second.starts_at));
  const firstDate = dates[0];
  const lastDate = dates.at(-1);
  const description = buildSeoDescription(
    activity.short_description,
    activity.description,
    activity.modality === "virtual" ? undefined : "En Ica, Perú.",
  );

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    description,
    endDate: toLimaDateTime(lastDate?.ends_at || lastDate?.starts_at),
    eventAttendanceMode: activity.modality === "virtual"
      ? "https://schema.org/OnlineEventAttendanceMode"
      : activity.modality === "hybrid"
        ? "https://schema.org/MixedEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: getActivityStatus(activity.status),
    image: image ? [image] : undefined,
    inLanguage: SITE_CONFIG.language,
    isAccessibleForFree: activity.is_free,
    location: getActivityLocation(input),
    name: activity.title,
    audience: activity.members_only ? {
      "@type": "Audience",
      audienceType: "Asociados de la Cámara de Comercio de Ica",
    } : undefined,
    offers: {
      "@type": "Offer",
      availability: activity.status === "published" && !activity.registrations_closed_manually
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
      price: activity.is_free ? 0 : activity.members_only ? activity.member_price : activity.general_price,
      priceCurrency: "PEN",
      url: pageUrl,
      validFrom: toLimaDateTime(activity.registration_open_at || activity.published_at),
    },
    organizer: {
      "@id": new URL(ORGANIZATION_ID_PATH, pageUrl).toString(),
      "@type": "Organization",
      name: SITE_CONFIG.organization,
      url: new URL("/", pageUrl).toString(),
    },
    performer: activity.speakers.length
      ? activity.speakers.map((speaker) => ({
        "@type": "Person",
        name: `${speaker.first_names} ${speaker.last_names}`.trim(),
      }))
      : undefined,
    startDate: toLimaDateTime(firstDate?.starts_at),
    subEvent: dates.length > 1 ? dates.map((date, index) => ({
      "@type": "Event",
      endDate: toLimaDateTime(date.ends_at || date.starts_at),
      eventAttendanceMode: activity.modality === "virtual"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : activity.modality === "hybrid"
          ? "https://schema.org/MixedEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: getActivityStatus(activity.status),
      location: getActivityLocation(input),
      name: `${activity.title} — ${date.label || `Sesión ${index + 1}`}`,
      startDate: toLimaDateTime(date.starts_at),
      url: pageUrl,
    })) : undefined,
    url: pageUrl,
  };
}

export function buildCourseJsonLd(input: CourseStructuredDataInput): JsonLdObject {
  const { course, image, pageUrl } = input;
  const instructors = course.instructors.map(({ speaker }) => ({
    "@type": "Person",
    name: `${speaker.first_names} ${speaker.last_names}`.trim(),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    description: buildSeoDescription(course.short_description, course.description),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      instructor: instructors.length ? instructors : undefined,
    },
    image: image || undefined,
    inLanguage: SITE_CONFIG.language,
    name: course.title,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: course.is_free ? 0 : course.general_price,
      priceCurrency: "PEN",
      url: pageUrl,
    },
    provider: {
      "@type": "Organization",
      name: SITE_CONFIG.organization,
      sameAs: new URL("/", pageUrl).toString(),
    },
    url: pageUrl,
  };
}

export function buildCourseListJsonLd(input: CourseListStructuredDataInput): JsonLdObject | null {
  if (input.courses.length < 3) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: input.courses.map((course, index) => ({
      "@type": "ListItem",
      item: {
        "@type": "Course",
        description: buildSeoDescription(course.short_description, course.title),
        name: course.title,
        provider: { "@type": "Organization", name: SITE_CONFIG.organization },
        url: absoluteUrl(getPublicCourseRoute(course.slug), input.siteUrl),
      },
      position: index + 1,
      url: absoluteUrl(getPublicCourseRoute(course.slug), input.siteUrl),
    })),
  };
}
