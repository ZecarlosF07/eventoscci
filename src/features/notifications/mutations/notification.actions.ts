"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { processPendingNotifications } from "@/features/notifications/services/process-notifications";

export async function retryNotificationAction(notificationId: string): Promise<void> {
  await requireAdmin();
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("retry_notification", { p_notification_id: notificationId });
  if (error) throw new Error("No fue posible reprogramar la notificación.", { cause: error });
  revalidatePath(ROUTES.adminNotifications);
}

export async function processNotificationsNowAction(): Promise<void> {
  await requireAdmin();
  await processPendingNotifications();
  revalidatePath(ROUTES.adminNotifications);
}
