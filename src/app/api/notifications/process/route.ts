import { getNotificationServerEnv } from "@/lib/env/server-env";
import { processPendingNotifications } from "@/features/notifications/services/process-notifications";

export async function POST(request: Request): Promise<Response> {
  let cronSecret: string;
  try {
    cronSecret = getNotificationServerEnv().cronSecret;
  } catch {
    return Response.json({ error: "Procesador no configurado." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }
  try {
    return Response.json(await processPendingNotifications());
  } catch {
    return Response.json({ error: "No fue posible procesar la cola." }, { status: 500 });
  }
}
