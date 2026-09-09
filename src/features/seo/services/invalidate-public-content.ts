import "server-only";

import { revalidatePath, updateTag } from "next/cache";

import { ROUTES } from "@/constants/routes";
import type { ActivityType } from "@/features/activities/types/activity.types";
import { PUBLIC_CACHE_TAGS } from "@/features/seo/constants/public-cache.constants";

export function invalidatePublicActivityContent(type: ActivityType): void {
  updateTag(PUBLIC_CACHE_TAGS.activities);
  updateTag(PUBLIC_CACHE_TAGS.availability);
  updateTag(PUBLIC_CACHE_TAGS.sitemap);
  revalidatePath(ROUTES.home);
  revalidatePath(type === "event" ? ROUTES.events : ROUTES.trainings);
  revalidatePath("/sitemap.xml");
}

export function invalidatePublicCourseContent(): void {
  updateTag(PUBLIC_CACHE_TAGS.courses);
  updateTag(PUBLIC_CACHE_TAGS.sitemap);
  revalidatePath(ROUTES.courses);
  revalidatePath("/sitemap.xml");
}

export function invalidatePublicCatalogContent(): void {
  updateTag(PUBLIC_CACHE_TAGS.categories);
  updateTag(PUBLIC_CACHE_TAGS.activities);
  updateTag(PUBLIC_CACHE_TAGS.courses);
  revalidatePath(ROUTES.home);
  revalidatePath(ROUTES.events);
  revalidatePath(ROUTES.trainings);
  revalidatePath(ROUTES.courses);
}
