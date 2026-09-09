import "server-only";

import type { SitemapEntries } from "@/features/seo/types/seo.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getSitemapEntries(): Promise<SitemapEntries> {
  const client = await createServerSupabaseClient();
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
}
