"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { CERTIFICATE_AUTO_ISSUE_BATCH_SIZE } from "@/features/certificates/constants/certificate.constants";
import { issueActivityCertificates } from "@/features/certificates/services/issue-certificates";
import { regenerateParticipantCertificates } from "@/features/certificates/services/regenerate-participant-certificates";
import type {
  CertificateIssueState,
  CertificateRegenerationState,
} from "@/features/certificates/types/certificate.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function issueCertificatesAction(
  activityId: string,
  _previousState: CertificateIssueState,
  formData: FormData,
): Promise<CertificateIssueState> {
  await requireAdmin();
  if (!z.uuid().safeParse(activityId).success) return { message: "La actividad no es válida." };
  const client = await createServerSupabaseClient();
  const autoIssue = formData.get("issue_mode") === "ready";
  const readyResult = autoIssue ? await client.rpc("get_activity_certificate_candidates_filtered", {
    p_activity_id: activityId,
    p_limit: CERTIFICATE_AUTO_ISSUE_BATCH_SIZE,
    p_offset: 0,
    p_emission_state: "ready",
  }) : null;
  if (readyResult?.error) return { message: "No se pudo verificar quiénes están listos para emitir. No se emitió ningún certificado." };
  const registrationIds = autoIssue
    ? (readyResult?.data ?? []).map((item) => item.registration_id)
    : [...new Set(formData.getAll("registration_ids").filter((value): value is string => typeof value === "string"))];
  if (registrationIds.length > 100 || registrationIds.some((id) => !z.uuid().safeParse(id).success)) return { message: "Selecciona hasta 100 participantes de esta actividad; no se ha emitido ningún certificado." };
  const scope = registrationIds.length ? await client.from("registrations").select("id").in("id", registrationIds).eq("activity_id", activityId).is("deleted_at", null) : { data: [], error: null };
  if (scope.error || scope.data.length !== registrationIds.length) return { message: "La selección contiene registros de otra actividad o eliminados. Revisa los seleccionados." };
  const templateId = formData.get("template_id");
  const condition = formData.get("condition");
  if (!registrationIds.length || typeof templateId !== "string" || typeof condition !== "string" || !condition.trim()) {
    return { message: autoIssue ? "Ya no hay personas listas para emitir. Actualiza la página." : "Selecciona participantes, plantilla y condición." };
  }
  const result = await issueActivityCertificates(registrationIds, templateId, condition.trim().slice(0, 120));
  revalidatePath(`${ROUTES.adminCertificatesActivities}/${activityId}`);
  revalidatePath(ROUTES.adminCertificates);
  return result;
}

export async function revokeCertificateAction(
  certificateId: string,
  returnPath: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const reasonValue = formData.get("revocation_reason");
  const reason = typeof reasonValue === "string" ? reasonValue.trim().slice(0, 500) : "";
  if (!reason) throw new Error("El motivo de revocación es obligatorio.");
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("revoke_certificate", { p_certificate_id: certificateId, p_reason: reason });
  if (error) throw new Error("No fue posible revocar el certificado.", { cause: error });
  revalidatePath(returnPath.startsWith("/admin/") ? returnPath : ROUTES.adminCertificates);
  revalidatePath(ROUTES.adminCertificates);
}

export async function regenerateParticipantCertificatesAction(
  participantId: string,
  _previousState: CertificateRegenerationState,
  formData: FormData,
): Promise<CertificateRegenerationState> {
  await requireAdmin();
  const parsedId = z.uuid().safeParse(participantId);
  if (!parsedId.success || formData.get("confirmed") !== "yes") {
    return { message: "Confirma la regeneración de los certificados." };
  }

  const result = await regenerateParticipantCertificates(parsedId.data);
  revalidatePath(`${ROUTES.adminParticipants}/${parsedId.data}`);
  revalidatePath(ROUTES.adminCertificatesActivities, "layout");
  revalidatePath(ROUTES.campusCertificates);
  revalidatePath("/certificados/[token]", "page");
  return result;
}
