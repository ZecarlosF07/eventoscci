import "server-only";

import { unstable_cache } from "next/cache";

import type { CategorySummary } from "@/features/categories/types/category.types";
import {
  PUBLIC_CACHE_REVALIDATE_SECONDS,
  PUBLIC_CACHE_TAGS,
} from "@/features/seo/constants/public-cache.constants";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { TypedSupabaseClient } from "@/lib/supabase/types/supabase-client.types";

export async function getActiveCategories(
  client: TypedSupabaseClient,
): Promise<CategorySummary[]> {
  const { data, error } = await client
    .from("categories")
    .select("id, name, slug, description")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error("No fue posible consultar las categorías.", {
      cause: error,
    });
  }

  return data;
}

export const getPublicActiveCategories = unstable_cache(
  async (): Promise<CategorySummary[]> => {
    return getActiveCategories(createPublicSupabaseClient());
  },
  ["public-active-categories"],
  { revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS, tags: [PUBLIC_CACHE_TAGS.categories] },
);
