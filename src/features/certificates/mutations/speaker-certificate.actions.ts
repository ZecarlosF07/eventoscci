"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { speakerCertificateRecipientSchema } from "@/features/certificates/schemas/speaker-certificate.schema";
import { issueSpeakerCertificates } from "@/features/certificates/services/issue-speaker-certificates";
import type { SpeakerCertificateIssueState } from "@/features/certificates/types/speaker-certificate.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCertificateGenerationData } from "@/features/certificates/queries/get-certificate-generation-data";
import { storeCertificatePdf } from "@/features/certificates/services/store-certificate-pdf";
import { CERTIFICATE_BUCKET } from "@/features/certificates/constants/certificate.constants";
import { getSiteUrl } from "@/lib/env/server-env";
import { hasValidSpeakerCertificateEmail } from "@/features/certificates/utils/speaker-certificate-eligibility";

export async function issueSpeakerCertificatesAction(
  activityId: string,
  _previousState: SpeakerCertificateIssueState,
  formData: FormData,
): Promise<SpeakerCertificateIssueState> {
  await requireAdmin();
  if (!z.uuid().safeParse(activityId).success) return { message: "La actividad no es válida." };
  const templateId = formData.get("template_id");
  const speakerIds = [...new Set(formData.getAll("speaker_ids").map(String))];
  if (typeof templateId !== "string" || (templateId !== "" && !z.uuid().safeParse(templateId).success) || !speakerIds.length || speakerIds.length > 100) {
    return { message: "Selecciona hasta 100 ponentes y una plantilla válida." };
  }
  const recipients = speakerIds.map((speakerId) => speakerCertificateRecipientSchema.safeParse({
    fullName: formData.get(`full_name_${speakerId}`) ?? undefined,
    role: formData.get(`role_${speakerId}`),
    speakerId,
  }));
  const invalid = recipients.find((result) => !result.success);
  if (invalid && !invalid.success) return { message: invalid.error.issues[0]?.message ?? "Revisa los roles seleccionados." };
  const parsedRecipients = recipients.flatMap((result) => result.success ? [result.data] : []);

  const client = await createServerSupabaseClient();
  const scope = await client.from("activity_speakers").select("speaker_id")
    .eq("activity_id", activityId).in("speaker_id", speakerIds).is("deleted_at", null);
  if (scope.error || scope.data.length !== speakerIds.length) {
    return { message: "La selección contiene ponentes que ya no pertenecen a esta actividad." };
  }
  const contacts = await client.from("speaker_private_details").select("speaker_id, email").in("speaker_id", speakerIds);
  if (contacts.error) return { message: "No fue posible verificar los correos de los ponentes." };
  const emails = new Map(contacts.data.map((contact) => [contact.speaker_id, contact.email]));
  if (speakerIds.some((id) => !hasValidSpeakerCertificateEmail(emails.get(id)))) {
    return { message: "Completa un correo electrónico válido para cada ponente antes de emitir." };
  }
  const result = await issueSpeakerCertificates(activityId, templateId, parsedRecipients);
  revalidatePath(`${ROUTES.adminCertificatesSpeakers}/${activityId}`);
  revalidatePath(ROUTES.adminCertificatesSpeakers);
  revalidatePath(ROUTES.adminCertificates);
  return result;
}

export async function regenerateSpeakerCertificateAction(certificateId: string): Promise<string> {
  await requireAdmin();
  if (!z.uuid().safeParse(certificateId).success) return "Certificado inválido.";
  const certificate = await getCertificateGenerationData(certificateId);
  if (!certificate || certificate.recipient_type !== "speaker" || certificate.status !== "issued" || !certificate.file_path) return "El certificado no está disponible para regeneración.";
  const client = await createServerSupabaseClient();
  const path = `issued/${certificate.id}/${crypto.randomUUID()}.pdf`;
  await storeCertificatePdf(client, certificate, getSiteUrl(), path);
  const result = await client.rpc("replace_speaker_certificate_file", {
    p_certificate_id: certificate.id, p_expected_file_path: certificate.file_path, p_new_file_path: path,
  });
  if (result.error) {
    await client.storage.from(CERTIFICATE_BUCKET).remove([path]);
    return "No se pudo regenerar. Actualiza la página y revisa el estado.";
  }
  const cleanup = await client.storage.from(CERTIFICATE_BUCKET).remove([certificate.file_path]);
  revalidatePath(ROUTES.adminCertificatesSpeakers, "layout");
  revalidatePath(`/certificados/${certificate.access_token}`);
  return cleanup.error ? "PDF regenerado. No se pudo limpiar el archivo anterior." : "PDF regenerado conservando sus datos originales.";
}
