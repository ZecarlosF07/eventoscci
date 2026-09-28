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
    paymentPendingRequests: row.payment_pending_requests ?? 0,
    paymentPendingSeats: row.payment_pending_seats ?? 0,
    certificatePendingCount: row.certificate_pending_count ?? 0,
    operationalEndsAt: row.operational_ends_at,
    isOperationalUpcoming: row.is_operational_upcoming ?? false,
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
    .order("payment_pending_requests", { ascending: false })
    .order("next_date", { ascending: true, nullsFirst: false })
    .order("last_date", { ascending: false, nullsFirst: false });

  if (filters.activityType) query = query.eq("type", filters.activityType);
  if (filters.period === "upcoming") query = query.eq("is_operational_upcoming", true);
  if (filters.period === "past") query = query.lte("operational_ends_at", new Date().toISOString());
  if (filters.paymentsOnly || filters.period === "payments") query = query.or("payment_pending_requests.gt.0,certificate_pending_count.gt.0");
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
    .from("participation_global_metrics")
    .select("*").single();
  if (error) throw new Error("No fue posible calcular los indicadores de participación.", { cause: error });
  return { active: data.active ?? 0, attended: data.attended ?? 0,
    confirmed: data.confirmed ?? 0, pending: data.pending ?? 0 };
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
