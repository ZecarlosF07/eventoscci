import "server-only";

import { unstable_cache } from "next/cache";

import {
  PUBLIC_ACTIVITY_PAGE_SIZE,
  PUBLIC_ACTIVITY_STATUSES,
} from "@/features/activities/constants/activity.constants";
import type {
  ActivityFilters,
  ActivityListItem,
  ActivityPublicPage,
  ActivityType,
} from "@/features/activities/types/activity.types";
import { filterAndSortActivities } from "@/features/activities/utils/filter-activities";
import {
  PUBLIC_CACHE_REVALIDATE_SECONDS,
  PUBLIC_CACHE_TAGS,
} from "@/features/seo/constants/public-cache.constants";
import { sanitizePostgrestSearchTerm } from "@/features/seo/utils/postgrest-search";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export const ACTIVITY_LIST_SELECT = `
  id, banner_path, capacity, general_price, is_free, member_price, members_only,
  modality, published_at, registration_close_at, registration_open_at,
  registrations_closed_manually,
  short_description, slug, status, title, type,
  category:categories!activities_category_id_fkey(id, name, slug),
  dates:activity_dates!inner(id, activity_id, starts_at, ends_at, label, sort_order,
    created_at, updated_at, deleted_at, deleted_by)
`;

const getCachedPublicActivityPage = unstable_cache(
async (type: ActivityType, filters: ActivityFilters): Promise<ActivityPublicPage> => {
  const client = createPublicSupabaseClient();
  const from = (filters.page - 1) * PUBLIC_ACTIVITY_PAGE_SIZE;
  let query = client
    .from("activities")
    .select(ACTIVITY_LIST_SELECT, { count: "exact" })
    .eq("type", type)
    .in("status", PUBLIC_ACTIVITY_STATUSES)
    .is("deleted_at", null)
    .not("published_at", "is", null)
    .is("activity_dates.deleted_at", null)
    .order("published_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, from + PUBLIC_ACTIVITY_PAGE_SIZE - 1);

  if (filters.category) query = query.eq("category_id", filters.category);
  if (filters.modality) query = query.eq("modality", filters.modality);
  if (filters.price) query = query.eq("is_free", filters.price === "free");
  if (filters.date) query = query.gte("activity_dates.starts_at", filters.date);
  if (filters.query) {
    const term = sanitizePostgrestSearchTerm(filters.query);
    if (term) query = query.or(`title.ilike.%${term}%,short_description.ilike.%${term}%`);
  }

  const { count, data, error } = await query;

  if (error && error.code !== "PGRST103") {
    throw new Error("No fue posible consultar las actividades públicas.", {
      cause: error,
    });
  }

  const total = count ?? 0;
  return {
    activities: filterAndSortActivities(data ?? [], filters),
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / PUBLIC_ACTIVITY_PAGE_SIZE)),
    total,
  };
}, ["public-activity-page"], {
  revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAGS.activities],
});

export function getPublicActivityPage(
  type: ActivityType,
  filters: ActivityFilters,
): Promise<ActivityPublicPage> {
  return getCachedPublicActivityPage(type, filters);
}

export async function getFeaturedPublicActivities(type: ActivityType): Promise<ActivityListItem[]> {
  return (await getCachedPublicActivityPage(type, { page: 1 })).activities;
}
