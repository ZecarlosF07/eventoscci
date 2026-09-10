import "server-only";

import type {
  ParticipationActivitySummary,
  ParticipationGlobalMetrics,
  ParticipationOverviewFilters,
  ParticipationOverviewPage,
} from "@/features/participation/types/participation.types";
import type { Database } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { escapePostgrestSearch } from "@/utils/postgrest-search";

const PAGE_SIZE = 12;
type SummaryRow = Database["public"]["Views"]["activity_participation_summary"]["Row"];

function normalize(row: SummaryRow): ParticipationActivitySummary {
  if (!row.activity_id || !row.slug || !row.status || !row.title || !row.type) {
    throw new Error("El resumen de participación no tiene el formato esperado.");
  }
  return {
    absentCount: row.absent_count ?? 0,
    activeCount: row.active_count ?? 0,
    activityId: row.activity_id,
    attendancePendingCount: row.attendance_pending_count ?? 0,
    attendedCount: row.attended_count ?? 0,
    cancelledCount: row.cancelled_count ?? 0,
    capacity: row.capacity,
    confirmedCount: row.confirmed_count ?? 0,
    isFree: row.is_free ?? false,
    lastDate: row.last_date,
    nextDate: row.next_date,
    pendingCount: row.pending_count ?? 0,
    slug: row.slug,
    status: row.status,
    title: row.title,
    totalCount: row.total_count ?? 0,
    type: row.type,
  };
}

export async function getParticipationOverview(
  filters: ParticipationOverviewFilters,
): Promise<ParticipationOverviewPage> {
  const client = await createServerSupabaseClient();
  const from = (filters.page - 1) * PAGE_SIZE;
  let query = client
    .from("activity_participation_summary")
    .select("*", { count: "exact" })
    .order("pending_count", { ascending: false })
    .order("next_date", { ascending: true, nullsFirst: false })
    .order("last_date", { ascending: false, nullsFirst: false });

  if (filters.activityType) query = query.eq("type", filters.activityType);
  if (filters.period === "upcoming") query = query.not("next_date", "is", null);
  if (filters.period === "past") query = query.is("next_date", null).not("last_date", "is", null);
  const search = filters.query ? escapePostgrestSearch(filters.query) : "";
  if (search) query = query.ilike("title", `%${search}%`);

  const { count, data, error } = await query.range(from, from + PAGE_SIZE - 1);
  if (error) throw new Error("No fue posible consultar la participación.", { cause: error });
  const total = count ?? 0;
  return {
    activities: (data ?? []).map(normalize),
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  };
}

export async function getParticipationGlobalMetrics(): Promise<ParticipationGlobalMetrics> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from("activity_participation_summary")
    .select("active_count, attended_count, confirmed_count, pending_count")
    .limit(1000);
  if (error) throw new Error("No fue posible calcular los indicadores de participación.", { cause: error });
  return (data ?? []).reduce<ParticipationGlobalMetrics>((totals, row) => ({
    active: totals.active + (row.active_count ?? 0),
    attended: totals.attended + (row.attended_count ?? 0),
    confirmed: totals.confirmed + (row.confirmed_count ?? 0),
    pending: totals.pending + (row.pending_count ?? 0),
  }), { active: 0, attended: 0, confirmed: 0, pending: 0 });
}

export async function getParticipationActivitySummary(
  activityId: string,
): Promise<ParticipationActivitySummary | null> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from("activity_participation_summary")
    .select("*")
    .eq("activity_id", activityId)
    .maybeSingle();
  if (error) throw new Error("No fue posible consultar el resumen de la actividad.", { cause: error });
  return data ? normalize(data) : null;
}
