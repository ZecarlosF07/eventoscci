import "server-only";

import type { NotificationFilters, NotificationItem, NotificationPage } from "@/features/notifications/types/notification.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { escapePostgrestSearch } from "@/utils/postgrest-search";

const PAGE_SIZE = 30;

export async function getNotifications(filters: NotificationFilters | number): Promise<NotificationPage> {
  const values = typeof filters === "number" ? { page: filters } : filters;
  const page = values.page;
  const client = await createServerSupabaseClient();
  const from = (page - 1) * PAGE_SIZE;
  let query = client.from("notification_outbox")
    .select("id, event_type, recipient_email, payload, status, attempts, next_attempt_at, last_error, sent_at, created_at", { count: "exact" })
    .is("deleted_at", null).order("created_at", { ascending: false });
  if (values.status) query = query.eq("status", values.status);
  if (values.eventType) query = query.eq("event_type", values.eventType);
  if (values.query) query = query.ilike("recipient_email", `%${escapePostgrestSearch(values.query)}%`);
  const { count, data, error } = await query.range(from, from + PAGE_SIZE - 1);
  if (error) throw new Error("No fue posible consultar las notificaciones.", { cause: error });
  const total = count ?? 0;
  return { notifications: (data ?? []) as NotificationItem[], page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)), total };
}
