import type { Database } from "@/lib/supabase/database.types";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export type CategorySummary = Pick<
  CategoryRow,
  "description" | "id" | "name" | "slug"
>;
