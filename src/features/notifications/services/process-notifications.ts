import "server-only";

import { getNotificationServerEnv } from "@/lib/env/server-env";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import type { NotificationDeliveryResult, NotificationItem } from "@/features/notifications/types/notification.types";

async function deliverNotification(notification: NotificationItem): Promise<void> {
  const { n8nWebhookSecret, n8nWebhookUrl } = getNotificationServerEnv();
  const response = await fetch(n8nWebhookUrl, {
    body: JSON.stringify({
      event_type: notification.event_type,
      notification_id: notification.id,
      payload: notification.payload,
      recipient_email: notification.recipient_email,
    }),
    headers: {
      "Content-Type": "application/json",
      ...(n8nWebhookSecret ? { "X-Webhook-Secret": n8nWebhookSecret } : {}),
    },
    method: "POST",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`n8n respondió con estado ${response.status}.`);
}

export async function processPendingNotifications(limit = 20): Promise<NotificationDeliveryResult> {
  const client = createServiceRoleSupabaseClient();
  const { data, error } = await client.rpc("claim_notification_batch", { p_limit: limit });
  if (error) throw new Error("No fue posible reclamar las notificaciones.", { cause: error });
  const notifications = (data ?? []) as NotificationItem[];
  let sent = 0;
  let failed = 0;
  for (const notification of notifications) {
    try {
      await deliverNotification(notification);
      await client.rpc("complete_notification_delivery", { p_notification_id: notification.id, p_success: true });
      sent += 1;
    } catch (deliveryError) {
      const message = deliveryError instanceof Error ? deliveryError.message : "Error no especificado";
      await client.rpc("complete_notification_delivery", { p_error: message, p_notification_id: notification.id, p_success: false });
      failed += 1;
    }
  }
  return { failed, processed: notifications.length, sent };
}
