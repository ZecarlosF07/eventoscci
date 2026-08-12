import "server-only";

import { PUBLIC_ACTIVITY_STATUSES } from "@/features/activities/constants/activity.constants";
import type {
  ActivityFilters,
  ActivityListItem,
  ActivityType,
} from "@/features/activities/types/activity.types";
import { filterAndSortActivities } from "@/features/activities/utils/filter-activities";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const ACTIVITY_LIST_SELECT = `
  id, banner_path, capacity, general_price, is_free, member_price, members_only,
  modality, published_at, short_description, slug, status, title, type,
  category:categories!activities_category_id_fkey(id, name, slug),
  dates:activity_dates(id, activity_id, starts_at, ends_at, label, sort_order,
    created_at, updated_at, deleted_at, deleted_by)
`;

export async function getPublicActivities(
  type: ActivityType,
  filters: ActivityFilters,
): Promise<ActivityListItem[]> {
  const client = await createServerSupabaseClient();
  let query = client
    .from("activities")
    .select(ACTIVITY_LIST_SELECT)
    .eq("type", type)
    .in("status", PUBLIC_ACTIVITY_STATUSES)
    .is("deleted_at", null)
    .not("published_at", "is", null)
    .is("activity_dates.deleted_at", null);

  if (filters.category) query = query.eq("category_id", filters.category);
  if (filters.modality) query = query.eq("modality", filters.modality);
  if (filters.price) query = query.eq("is_free", filters.price === "free");

  const { data, error } = await query;

  if (error) {
    throw new Error("No fue posible consultar las actividades públicas.", {
      cause: error,
    });
  }

  return filterAndSortActivities(data, filters);
}
