import { PUBLIC_ACTIVITY_PAGE_SIZE } from "@/features/activities/constants/activity.constants";
import { publicEventFiltersSchema } from "@/features/activities/schemas/event-catalog.schema";
import type { ActivityFilters } from "@/features/activities/types/activity.types";
import type { EventCatalogArguments, EventCatalogView } from "@/features/activities/types/event-catalog.types";

export function getEventCatalogArguments(view: EventCatalogView, filters: ActivityFilters, pageSize = PUBLIC_ACTIVITY_PAGE_SIZE): EventCatalogArguments | null {
  const parsed = publicEventFiltersSchema.safeParse({ ...filters, category: filters.category || undefined, date: filters.date || undefined });
  if (!parsed.success || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > PUBLIC_ACTIVITY_PAGE_SIZE) return null;
  return {
    p_view: view,
    p_page: parsed.data.page,
    p_page_size: pageSize,
    p_category_id: parsed.data.category,
    p_date: parsed.data.date,
    p_modality: filters.modality,
    p_is_free: filters.price ? filters.price === "free" : undefined,
    p_query: filters.query,
  };
}
