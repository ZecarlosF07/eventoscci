import "server-only";

import { ACTIVITY_PAGE_SIZE } from "@/features/activities/constants/activity.constants";
import type {
  ActivityAdminFilters,
  ActivityAdminPage,
} from "@/features/activities/types/activity.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const ADMIN_ACTIVITY_SELECT = `
  id, banner_path, capacity, general_price, is_free, member_price, members_only,
  modality, published_at, registration_close_at, registration_open_at,
  registrations_closed_manually,
  short_description, slug, status, title, type,
  category:categories!activities_category_id_fkey(id, name, slug),
  dates:activity_dates(id, activity_id, starts_at, ends_at, label, sort_order,
    created_at, updated_at, deleted_at, deleted_by)
`;

export async function getAdminActivities(
  filters: ActivityAdminFilters,
): Promise<ActivityAdminPage> {
  const client = await createServerSupabaseClient();
  const from = (filters.page - 1) * ACTIVITY_PAGE_SIZE;
  const to = from + ACTIVITY_PAGE_SIZE - 1;
  let query = client
    .from("activities")
    .select(ADMIN_ACTIVITY_SELECT, { count: "exact" })
    .eq("type", filters.type)
    .is("deleted_at", null)
    .is("activity_dates.deleted_at", null)
    .order("updated_at", { ascending: false })
    .range(from, to);

  const archivedCountQuery = client
    .from("activities")
    .select("id", { count: "exact", head: true })
    .eq("type", filters.type)
    .eq("status", "archived")
    .is("deleted_at", null);

  query = filters.view === "archived"
    ? query.eq("status", "archived")
    : query.neq("status", "archived");

  if (filters.query) query = query.ilike("title", `%${filters.query}%`);
  if (filters.status) query = query.eq("status", filters.status);

  const [{ count, data, error }, archivedResult] = await Promise.all([
    query,
    archivedCountQuery,
  ]);

  if (error || archivedResult.error) {
    throw new Error("No fue posible cargar el listado administrativo.", {
      cause: error ?? archivedResult.error,
    });
  }

  const total = count ?? 0;
  return {
    activities: data,
    archivedTotal: archivedResult.count ?? 0,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / ACTIVITY_PAGE_SIZE)),
    total,
  };
}
