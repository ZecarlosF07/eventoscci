import { z } from "zod";

import type { NotificationFilters } from "@/features/notifications/types/notification.types";

export const NOTIFICATION_EVENT_LABELS: Record<string, string> = {
  activity_certificate_issued: "Certificado emitido", activity_certificate_offer: "Oferta de certificado",
  activity_certificate_request_created: "Solicitud de certificado", activity_free_registration_confirmed: "Inscripción gratuita confirmada",
  activity_group_request_received: "Solicitud grupal recibida", activity_paid_preregistration_created: "Preinscripción recibida",
  activity_paid_registration_confirmed: "Pago de participación confirmado", activity_registration_cancelled: "Inscripción cancelada",
  activity_virtual_session_reminder: "Recordatorio de sesión", course_certificate_issued: "Certificado de curso",
};
export function parseNotificationFilters(params: Record<string, string | string[] | undefined>): NotificationFilters {
  const first = (key: string) => Array.isArray(params[key]) ? params[key][0] : params[key];
  const page = Number(first("pagina"));
  const eventType = first("evento");
  return { page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    query: first("q")?.trim().slice(0, 150),
    status: z.enum(["pending", "processing", "sent", "failed", "cancelled"]).safeParse(first("estado")).data,
    eventType: eventType && eventType in NOTIFICATION_EVENT_LABELS ? eventType : undefined };
}
