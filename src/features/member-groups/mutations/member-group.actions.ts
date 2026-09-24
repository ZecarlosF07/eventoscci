"use server";

import { createHash } from "node:crypto";

import { updateTag } from "next/cache";
import { headers } from "next/headers";

import { deliverNotificationImmediately, deliverNotificationImmediatelyById } from "@/features/notifications/services/process-notifications";
import { memberCompanyLookupSchema, memberGroupInputSchema, memberGroupSubmissionSchema } from "@/features/member-groups/schemas/member-group.schema";
import type { MemberGroupInput, MemberGroupSubmissionResult } from "@/features/member-groups/types/member-group.types";
import { PUBLIC_CACHE_TAGS } from "@/features/seo/constants/public-cache.constants";
import type { Json } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export async function lookupMemberCompany(ruc: string): Promise<{ legalName?: string; message?: string }> {
  if (!/^\d{11}$/.test(ruc)) return { message: "El RUC debe tener 11 dígitos." };
  const requestHeaders = await headers();
  const clientIp = requestHeaders.get("x-real-ip")
    ?? requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
  const bucket = createHash("sha256").update(clientIp).digest("hex");
  const client = createServiceRoleSupabaseClient();
  const { data, error } = await client.rpc("lookup_active_member_company_limited", {
    p_bucket_hash: bucket,
    p_ruc: ruc,
  });
  if (error) return { message: error.message.includes("LOOKUP_RATE_LIMITED")
    ? "Demasiadas consultas. Espera un minuto antes de intentarlo nuevamente."
    : "No se pudo verificar el RUC. Inténtalo nuevamente." };
  const company = memberCompanyLookupSchema.safeParse(data);
  return company.success ? { legalName: company.data.legal_name }
    : { message: "Este RUC no figura como asociado activo. Comunícate con la CCI si necesitas ayuda." };
}

export async function registerMemberGroup(
  activityId: string,
  input: MemberGroupInput,
  idempotencyKey: string,
): Promise<{ data?: MemberGroupSubmissionResult; message?: string; success: boolean }> {
  const parsed = memberGroupInputSchema.safeParse(input);
  if (!parsed.success || !/^[0-9a-f-]{36}$/i.test(idempotencyKey)) {
    return { message: "Revisa los datos de la empresa, asistentes y comprobante antes de enviar.", success: false };
  }

  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("register_member_group", {
    p_activity_id: activityId,
    p_idempotency_key: idempotencyKey,
    p_request: parsed.data as Json,
  });
  if (error) {
    const message = error.message;
    return { message: message.includes("MEMBER_RUC_INACTIVE") ? "El RUC ya no figura como asociado activo. Verifícalo nuevamente."
      : message.includes("GROUP_RATE_LIMITED") ? "Se alcanzó el límite temporal de solicitudes para este RUC. Contacta a la CCI para continuar."
      : message.includes("NO_AVAILABLE_CAPACITY") ? "No quedan cupos para todo el grupo. Reduce asistentes y vuelve a intentar."
        : message.includes("DUPLICATE_REGISTRATION") ? "Una persona ya está inscrita en este evento. Revisa los documentos."
          : message.includes("REGISTRATION_CLOSED") ? "Las inscripciones para este evento están cerradas."
            : "No se pudo registrar el grupo. Conservamos tus datos en pantalla para que puedas intentarlo de nuevo.", success: false };
  }

  const result = memberGroupSubmissionSchema.safeParse(data);
  if (!result.success) return { message: "Se registró la solicitud, pero no pudimos mostrar el resultado. Contacta a la CCI.", success: false };

  if (result.data.is_free) {
    const service = createServiceRoleSupabaseClient();
    const { data: registrations } = await service.from("registrations")
      .select("id").eq("member_group_request_id", result.data.request_id);
    await Promise.all((registrations ?? []).map((registration) => deliverNotificationImmediately({
      eventType: "activity_free_registration_confirmed",
      relatedEntityId: registration.id,
      relatedEntityType: "registration",
    })));
  } else {
    await deliverNotificationImmediately({
      eventType: "activity_group_request_received",
      relatedEntityId: result.data.request_id,
      relatedEntityType: "member_group_request",
    });
  }

  const service = createServiceRoleSupabaseClient();
  const { data: requestedCertificates } = await service.from("registrations")
    .select("id").eq("member_group_request_id", result.data.request_id)
    .not("certificate_requested_at", "is", null);
  const certificateIds = (requestedCertificates ?? []).map((item) => item.id);
  if (certificateIds.length) {
    const { data: notifications } = await service.from("notification_outbox")
      .select("id").eq("event_type", "activity_certificate_request_created")
      .in("related_entity_id", certificateIds);
    await Promise.all((notifications ?? []).map((item) => deliverNotificationImmediatelyById(item.id)));
  }
  updateTag(PUBLIC_CACHE_TAGS.availability);
  return { data: { access_token: result.data.access_token, group: result.data, replayed: result.data.replayed }, success: true };
}
