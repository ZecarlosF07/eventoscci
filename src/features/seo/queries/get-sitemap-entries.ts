import "server-only";

import { unstable_cache } from "next/cache";

import {
  PUBLIC_CACHE_REVALIDATE_SECONDS,
  PUBLIC_CACHE_TAGS,
} from "@/features/seo/constants/public-cache.constants";
import type { SitemapEntries } from "@/features/seo/types/seo.types";
import { shouldSkipRemoteBuildData } from "@/lib/env/build-env";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export const getSitemapEntries = unstable_cache(async (): Promise<SitemapEntries> => {
  if (shouldSkipRemoteBuildData()) return { activities: [], courses: [] };

  const client = createPublicSupabaseClient();
  const [activitiesResult, coursesResult] = await Promise.all([
    client.from("activities")
      .select("banner_path, slug, type, updated_at")
      .in("status", ["published", "finished"])
      .not("published_at", "is", null)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false }),
    client.from("courses")
      .select("banner_path, slug, updated_at")
      .eq("status", "published")
      .not("published_at", "is", null)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false }),
  ]);

  if (activitiesResult.error || coursesResult.error) {
    throw new Error("No fue posible generar el mapa del sitio.", {
      cause: activitiesResult.error ?? coursesResult.error,
    });
  }

  return {
    activities: activitiesResult.data ?? [],
    courses: coursesResult.data ?? [],
  };
}, ["public-sitemap-entries"], {
  revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAGS.sitemap],
});
