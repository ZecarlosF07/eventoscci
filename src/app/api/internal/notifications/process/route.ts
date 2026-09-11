import { isNotificationCronAuthorized } from "@/features/notifications/services/notification-cron-auth";
import { processDueVirtualReminders } from "@/features/notifications/services/process-notifications";
import { logger } from "@/lib/observability/logger";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  try {
    if (!isNotificationCronAuthorized(request)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await processDueVirtualReminders();
    return Response.json(result);
  } catch (error) {
    logger.error("notification_cron_failed", {
      error: error instanceof Error ? error.message : "Error no especificado",
    });
    return Response.json({ error: "Notification processing failed" }, { status: 500 });
  }
}
