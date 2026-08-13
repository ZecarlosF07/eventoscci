import type { Json } from "@/lib/supabase/database.types";

export function certificateTemplateShowsDate(config: Json): boolean {
  return !(config && typeof config === "object" && !Array.isArray(config) && config.show_date === false);
}
