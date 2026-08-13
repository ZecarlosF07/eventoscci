import "server-only";

import type { NotificationItem, NotificationPage } from "@/features/notifications/types/notification.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const PAGE_SIZE = 30;

export async function getNotifications(page: number): Promise<NotificationPage> {
  const client = await createServerSupabaseClient();
  const from = (page - 1) * PAGE_SIZE;
  const { count, data, error } = await client.from("notification_outbox")
    .select("id, event_type, recipient_email, payload, status, attempts, next_attempt_at, last_error, sent_at, created_at", { count: "exact" })
    .is("deleted_at", null).order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
  if (error) throw new Error("No fue posible consultar las notificaciones.", { cause: error });
  const total = count ?? 0;
  return { notifications: (data ?? []) as NotificationItem[], page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)), total };
}
