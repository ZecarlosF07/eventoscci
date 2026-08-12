import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ActivityDetailTemplate } from "@/components/templates/ActivityDetailTemplate";
import { getPublicActivityBySlug } from "@/features/activities/queries/get-public-activity";
import type { ActivityDetailPageProps } from "@/features/activities/types/activity-page.types";
import { getActivityBannerUrl } from "@/features/activities/utils/activity-formatters";

export async function generateMetadata({ params }: ActivityDetailPageProps): Promise<Metadata> {
  const activity = await getPublicActivityBySlug("event", (await params).slug);
  if (!activity) return { title: "Evento no encontrado" };
  const image = getActivityBannerUrl(activity.banner_path);
  return {
    description: activity.short_description ?? activity.description.slice(0, 160),
    openGraph: image ? { images: [image], title: activity.title } : undefined,
    title: activity.title,
  };
}

export default async function EventDetailPage({ params }: ActivityDetailPageProps) {
  const activity = await getPublicActivityBySlug("event", (await params).slug);
  if (!activity) notFound();
  return <ActivityDetailTemplate activity={activity} />;
}
