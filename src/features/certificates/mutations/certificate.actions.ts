"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { issueActivityCertificates } from "@/features/certificates/services/issue-certificates";
import type { CertificateIssueState } from "@/features/certificates/types/certificate.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function issueCertificatesAction(
  activityId: string,
  _previousState: CertificateIssueState,
  formData: FormData,
): Promise<CertificateIssueState> {
  await requireAdmin();
  const registrationIds = formData.getAll("registration_ids").filter((value): value is string => typeof value === "string");
  const templateId = formData.get("template_id");
  const condition = formData.get("condition");
  if (!registrationIds.length || typeof templateId !== "string" || typeof condition !== "string" || !condition.trim()) {
    return { message: "Selecciona participantes, plantilla y condición." };
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
