import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WhatsAppCommunityButton } from "@/components/atoms/WhatsAppCommunityButton";
import { ActivityDetailTemplate } from "@/components/templates/ActivityDetailTemplate";
import { ROUTES } from "@/constants/routes";
import { getPublicActivityBySlug } from "@/features/activities/queries/get-public-activity";
import type { ActivityDetailPageProps } from "@/features/activities/types/activity-page.types";
import { getActivityBannerUrl } from "@/features/activities/utils/activity-formatters";
import { getPublicActivityRoute } from "@/features/activities/utils/activity-routes";
import { canShowActivityPublicContact } from "@/features/activities/utils/activity-public-contact";
import { getRegistrationAvailability } from "@/features/registrations/queries/get-registration-availability";
import { getServerTimestamp } from "@/utils/get-server-timestamp";
import { JsonLd } from "@/features/seo/components/JsonLd";
import { buildNoIndexMetadata, buildPageMetadata } from "@/features/seo/services/build-page-metadata";
import { buildActivityJsonLd, buildBreadcrumbJsonLd } from "@/features/seo/utils/json-ld";
import { absoluteUrl } from "@/features/seo/utils/seo-url";
import { buildSeoDescription } from "@/features/seo/utils/seo-text";
import { getSiteUrl } from "@/lib/env/server-env";

export async function generateMetadata({ params }: ActivityDetailPageProps): Promise<Metadata> {
  const activity = await getPublicActivityBySlug("event", (await params).slug);
  if (!activity) return buildNoIndexMetadata("Evento no encontrado");
  const image = getActivityBannerUrl(activity.banner_path);
  return buildPageMetadata({
    description: buildSeoDescription(
      activity.short_description,
      activity.description,
      activity.modality === "virtual" ? undefined : "En Ica, Perú.",
    ),
    follow: true,
    image,
    index: activity.is_listed && activity.status !== "cancelled",
    path: getPublicActivityRoute(activity.type, activity.slug),
    title: activity.title,
  });
}

export default async function EventDetailPage({ params }: ActivityDetailPageProps) {
  const activity = await getPublicActivityBySlug("event", (await params).slug);
  if (!activity) notFound();
  const now = getServerTimestamp();
  const availability = await getRegistrationAvailability(activity.id);
  const siteUrl = getSiteUrl();
  const path = getPublicActivityRoute(activity.type, activity.slug);
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Inicio", path: ROUTES.home },
    { name: "Eventos", path: ROUTES.events },
    { name: activity.title, path },
  ], siteUrl);
  const structuredData = activity.is_listed && activity.status !== "cancelled"
    ? [breadcrumbs, buildActivityJsonLd({
      activity,
      availability,
      now,
      image: getActivityBannerUrl(activity.banner_path),
      pageUrl: absoluteUrl(path, siteUrl),
    })]
    : [];

  return (
    <>
      <JsonLd data={structuredData} />
      <ActivityDetailTemplate activity={activity} />
      {canShowActivityPublicContact(activity.type, activity.members_only) ? <WhatsAppCommunityButton /> : null}
    </>
  );
}
