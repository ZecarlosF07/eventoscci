"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { deliverNotificationImmediatelyById } from "@/features/notifications/services/process-notifications";

export async function retryNotificationAction(notificationId: string): Promise<void> {
  await requireAdmin();
  await deliverNotificationImmediatelyById(notificationId);
  revalidatePath(ROUTES.adminNotifications);
}
