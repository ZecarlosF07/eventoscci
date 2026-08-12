import "server-only";

import { getActiveCategories } from "@/features/categories/queries/get-active-categories";
import { getActiveSpeakers } from "@/features/speakers/queries/get-active-speakers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getActivityFormOptions() {
  const client = await createServerSupabaseClient();
  const [categories, speakers] = await Promise.all([
    getActiveCategories(client),
    getActiveSpeakers(client),
  ]);
  return { categories, speakers };
}
