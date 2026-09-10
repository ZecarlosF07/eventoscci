"use server";

import { z } from "zod";

import { deliverNotificationImmediatelyById } from "@/features/notifications/services/process-notifications";
import { certificateRequestRpcResultSchema } from "@/features/registrations/schemas/registration.schema";
import type { CertificateRequestActionResult } from "@/features/registrations/types/certificate-request.types";
import { getCertificateRequestWhatsAppUrl } from "@/features/registrations/utils/certificate-request-whatsapp";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const certificateRequestInputSchema = z.object({
  registrationCode: z.string().trim().min(1).max(40),
  requestToken: z.uuid(),
});

export async function requestActivityCertificateAction(
  registrationCode: string,
  requestToken: string,
): Promise<CertificateRequestActionResult> {
  const input = certificateRequestInputSchema.safeParse({ registrationCode, requestToken });
  if (!input.success) {
    return { message: "El enlace de solicitud no es válido.", success: false };
  }

  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("request_activity_certificate", {
    p_registration_code: input.data.registrationCode,
    p_request_token: input.data.requestToken,
  });
  if (error) {
    return {
      message: error.message.includes("NOT_AVAILABLE")
        ? "La solicitud de certificado todavía no está disponible para esta inscripción."
        : "No pudimos registrar tu solicitud. Inténtalo nuevamente.",
      success: false,
    };
  }

  const result = certificateRequestRpcResultSchema.safeParse(data);
  if (!result.success) {
    return { message: "No pudimos preparar el contacto con el responsable.", success: false };
  }

  const url = getCertificateRequestWhatsAppUrl({
    activityTitle: result.data.activity_title,
    certificatePrice: result.data.certificate_price,
    phone: result.data.contact_whatsapp_phone,
    registrationCode: result.data.registration_code,
    registrationType: result.data.registration_type,
  });
  if (!url) {
    return { message: "El responsable no tiene un WhatsApp válido configurado.", success: false };
  }

  if (result.data.notification_id) {
    await deliverNotificationImmediatelyById(result.data.notification_id);
  }

  return { success: true, url };
}
