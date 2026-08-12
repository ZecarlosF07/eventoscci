import type { CategorySummary } from "@/features/categories/types/category.types";
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
