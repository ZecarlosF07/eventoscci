import { z } from "zod";

import { getCurrentAccount } from "@/features/auth/queries/get-current-account";
import { getBillingDetail } from "@/features/billing/queries/get-billing";
import type { BillingDetailRouteContext } from "@/features/billing/types/billing.types";

const headers = { "Cache-Control": "private, no-store" };

export async function GET(_request: Request, context: BillingDetailRouteContext) {
  const account = await getCurrentAccount();
  if (!account?.isActive || account.role === "student") {
    return Response.json({ error: "No autorizado. Vuelve a iniciar sesión con una cuenta interna." }, { status: 403, headers });
  }
  const ids = z.object({ activityId: z.uuid(), requestId: z.uuid() }).safeParse(await context.params);
  if (!ids.success) return Response.json({ error: "La solicitud no es válida." }, { status: 400, headers });
  try {
    const detail = await getBillingDetail(ids.data.activityId, ids.data.requestId);
    if (!detail) return Response.json({ error: "La solicitud no está disponible en esta actividad." }, { status: 404, headers });
    return Response.json(detail, { headers });
  } catch (error) {
    console.error("No fue posible cargar los datos para comprobantes.", error);
    return Response.json({ error: "No se pudo cargar el detalle. Intenta nuevamente." }, { status: 500, headers });
  }
}
