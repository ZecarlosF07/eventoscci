import "server-only";

import { revalidatePath, updateTag } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { PUBLIC_CACHE_TAGS } from "@/features/seo/constants/public-cache.constants";

export function invalidatePublicActivityContent(): void {
  updateTag(PUBLIC_CACHE_TAGS.activities);
  updateTag(PUBLIC_CACHE_TAGS.availability);
  updateTag(PUBLIC_CACHE_TAGS.sitemap);
  revalidatePath(ROUTES.home);
  // Route groups belong to the internal route tree used by revalidatePath.
  // Both catalogs share activity data; layout invalidation also covers registrations.
  revalidatePath("/(public)/eventos", "layout");
  revalidatePath("/(public)/capacitaciones", "layout");
  revalidatePath(ROUTES.events);
  revalidatePath(ROUTES.trainings);
  revalidatePath("/buscar");
  revalidatePath("/(public)/certificados/[token]", "page");
  revalidatePath(ROUTES.certificates);
  revalidatePath(ROUTES.campusCertificates);
  revalidatePath(ROUTES.adminRegistrations, "layout");
  revalidatePath(ROUTES.adminCertificatesActivities, "layout");
  revalidatePath("/sitemap.xml");
}

export function invalidatePublicCourseContent(): void {
  updateTag(PUBLIC_CACHE_TAGS.courses);
  updateTag(PUBLIC_CACHE_TAGS.sitemap);
  revalidatePath(ROUTES.home);
  revalidatePath(ROUTES.courses);
  revalidatePath("/(public)/cursos", "layout");
  revalidatePath("/buscar");
  revalidatePath("/sitemap.xml");
}

export function invalidatePublicCatalogContent(): void {
  updateTag(PUBLIC_CACHE_TAGS.categories);
  updateTag(PUBLIC_CACHE_TAGS.activities);
  updateTag(PUBLIC_CACHE_TAGS.courses);
  updateTag(PUBLIC_CACHE_TAGS.availability);
  updateTag(PUBLIC_CACHE_TAGS.sitemap);
  revalidatePath(ROUTES.home);
  revalidatePath(ROUTES.events);
  revalidatePath(ROUTES.trainings);
  revalidatePath(ROUTES.courses);
  revalidatePath("/(public)/eventos", "layout");
  revalidatePath("/(public)/capacitaciones", "layout");
  revalidatePath("/(public)/cursos", "layout");
  revalidatePath("/buscar");
  revalidatePath("/sitemap.xml");
}
