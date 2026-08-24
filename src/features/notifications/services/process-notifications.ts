import "server-only";

import {
  NOTIFICATION_ERROR_MAX_LENGTH,
  NOTIFICATION_SELECT,
  NOTIFICATION_WEBHOOK_TIMEOUT_MS,
} from "@/features/notifications/constants/notification.constants";
import type {
  NotificationItem,
  NotificationReference,
} from "@/features/notifications/types/notification.types";
import { getNotificationServerEnv } from "@/lib/env/server-env";
import { logger } from "@/lib/observability/logger";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

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
    signal: AbortSignal.timeout(NOTIFICATION_WEBHOOK_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`n8n respondió con estado ${response.status}.`);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, NOTIFICATION_ERROR_MAX_LENGTH);
  return "Error no especificado";
}

function isDeliverable(notification: NotificationItem): boolean {
  return notification.status === "failed" || notification.status === "pending";
}

async function claimNotification(
  client: ReturnType<typeof createServiceRoleSupabaseClient>,
  notification: NotificationItem,
): Promise<NotificationItem | null> {
  if (!isDeliverable(notification)) return null;

  const { data, error } = await client
    .from("notification_outbox")
    .update({
      attempts: notification.attempts + 1,
      last_error: null,
      next_attempt_at: null,
      status: "processing",
    })
    .eq("id", notification.id)
    .eq("attempts", notification.attempts)
    .eq("status", notification.status)
    .select(NOTIFICATION_SELECT)
    .maybeSingle();

  if (error) throw new Error("No fue posible reclamar la notificación.", { cause: error });
  return data;
}

async function markNotificationAsSent(
  client: ReturnType<typeof createServiceRoleSupabaseClient>,
  notificationId: string,
): Promise<void> {
  const { error } = await client
    .from("notification_outbox")
    .update({
      last_error: null,
      next_attempt_at: null,
      sent_at: new Date().toISOString(),
      status: "sent",
    })
    .eq("id", notificationId)
    .eq("status", "processing");

  if (error) throw new Error("No fue posible registrar la entrega.", { cause: error });
}

async function markNotificationAsFailed(
  client: ReturnType<typeof createServiceRoleSupabaseClient>,
  notificationId: string,
  message: string,
): Promise<boolean> {
  const { error } = await client
    .from("notification_outbox")
    .update({
      last_error: message,
      next_attempt_at: null,
      sent_at: null,
      status: "failed",
    })
    .eq("id", notificationId)
    .eq("status", "processing");

  return error === null;
}

async function deliverClaimedNotification(
  client: ReturnType<typeof createServiceRoleSupabaseClient>,
  notification: NotificationItem,
): Promise<boolean> {
  try {
    await deliverNotification(notification);
  } catch (deliveryError) {
    const message = getErrorMessage(deliveryError);
    const persisted = await markNotificationAsFailed(client, notification.id, message);
    logger.warn("notification_immediate_delivery_failed", {
      eventType: notification.event_type,
      notificationId: notification.id,
      persisted,
    });
    return false;
  }

  try {
    await markNotificationAsSent(client, notification.id);
  } catch (persistenceError) {
    logger.error("notification_delivery_status_failed", {
      error: getErrorMessage(persistenceError),
      eventType: notification.event_type,
      notificationId: notification.id,
    });
    return true;
  }

  logger.info("notification_delivered_immediately", {
    eventType: notification.event_type,
    notificationId: notification.id,
  });
  return true;
}

async function deliverCandidate(
  client: ReturnType<typeof createServiceRoleSupabaseClient>,
  notification: NotificationItem | null,
): Promise<boolean> {
  if (!notification) return false;

  const claimed = await claimNotification(client, notification);
  if (!claimed) return false;
  return deliverClaimedNotification(client, claimed);
}

export async function deliverNotificationImmediatelyById(notificationId: string): Promise<boolean> {
  try {
    const client = createServiceRoleSupabaseClient();
    const { data, error } = await client
      .from("notification_outbox")
      .select(NOTIFICATION_SELECT)
      .eq("id", notificationId)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw new Error("No fue posible consultar la notificación.", { cause: error });
    return deliverCandidate(client, data);
  } catch (error) {
    logger.error("notification_immediate_delivery_unavailable", {
      error: getErrorMessage(error),
      notificationId,
    });
    return false;
  }
}

export async function deliverNotificationImmediately(
  reference: NotificationReference,
): Promise<boolean> {
  try {
    const client = createServiceRoleSupabaseClient();
    const { data, error } = await client
      .from("notification_outbox")
      .select(NOTIFICATION_SELECT)
      .eq("event_type", reference.eventType)
      .eq("related_entity_id", reference.relatedEntityId)
      .eq("related_entity_type", reference.relatedEntityType)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw new Error("No fue posible consultar la notificación.", { cause: error });
    return deliverCandidate(client, data);
  } catch (error) {
    logger.error("notification_immediate_delivery_unavailable", {
      error: getErrorMessage(error),
      eventType: reference.eventType,
      relatedEntityId: reference.relatedEntityId,
    });
    return false;
  }
}
