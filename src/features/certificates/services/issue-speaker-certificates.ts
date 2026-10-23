import "server-only";

import { CERTIFICATE_BUCKET } from "@/features/certificates/constants/certificate.constants";
import {
  finalizeSpeakerCertificateResultSchema,
  prepareSpeakerCertificateResultSchema,
} from "@/features/certificates/schemas/speaker-certificate.schema";
import { getCertificateGenerationData } from "@/features/certificates/queries/get-certificate-generation-data";
import { storeCertificatePdf } from "@/features/certificates/services/store-certificate-pdf";
import type {
  SpeakerCertificateIssueState,
  SpeakerCertificateRecipientInput,
} from "@/features/certificates/types/speaker-certificate.types";
import { deliverNotificationImmediately } from "@/features/notifications/services/process-notifications";
import { getSiteUrl } from "@/lib/env/server-env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/supabase-error";

async function generateSpeakerCertificate(certificateId: string): Promise<void> {
  const client = await createServerSupabaseClient();
  const certificate = await getCertificateGenerationData(certificateId);
  if (!certificate || certificate.recipient_type !== "speaker" || certificate.status === "revoked") {
    throw new Error("CERTIFICATE_NOT_AVAILABLE");
  }
  if (certificate.file_path) return;
  const claim = await client.rpc("claim_speaker_certificate", { p_certificate_id: certificateId });
  if (claim.error) throw new Error(getSupabaseErrorMessage(claim.error, {
    fallback: "No se pudo iniciar la generación. Actualiza la pantalla y reintenta.",
    messages: { SPEAKER_EMAIL_REQUIRED: "Completa el correo electrónico del ponente antes de emitir.", SPEAKER_DOCUMENT_REQUIRED: "Completa el DNI del ponente antes de emitir." },
  }));
  if (!claim.data) throw new Error("La emisión está en curso. Reintenta después de unos minutos.");
  const siteUrl = getSiteUrl();
  const filePath = await storeCertificatePdf(client, certificate, siteUrl, `issued/${certificate.id}/${claim.data}.pdf`);
  const finalizeResult = await client.rpc("finalize_speaker_certificate", {
    p_certificate_id: certificate.id,
    p_file_path: filePath,
    p_public_base_url: siteUrl,
    p_lease_token: claim.data,
  });
  const parsed = finalizeSpeakerCertificateResultSchema.safeParse(finalizeResult.data);
  if (finalizeResult.error || !parsed.success) {
    await client.storage.from(CERTIFICATE_BUCKET).remove([filePath]);
    throw new Error(finalizeResult.error ? getSupabaseErrorMessage(finalizeResult.error, {
      fallback: "No se pudo finalizar el certificado. Revisa sus datos e inténtalo nuevamente.",
      messages: { SPEAKER_EMAIL_REQUIRED: "Completa el correo electrónico del ponente antes de emitir." },
    }) : "No se pudo confirmar la finalización del certificado.", { cause: finalizeResult.error ?? parsed.error });
  }
  if (parsed.data.notification_queued) {
    await deliverNotificationImmediately({
      eventType: "speaker_certificate_issued",
      relatedEntityId: certificate.id,
      relatedEntityType: "certificate",
    });
  }
}

export async function issueSpeakerCertificates(
  activityId: string,
  templateId: string,
  recipients: SpeakerCertificateRecipientInput[],
): Promise<SpeakerCertificateIssueState> {
  const client = await createServerSupabaseClient();
  const prepareResult = await client.rpc("prepare_speaker_certificates", {
    p_activity_id: activityId,
    p_recipients: recipients.map((item) => ({
      ...(item.fullName !== undefined ? { full_name: item.fullName } : {}),
      role: item.role,
      speaker_id: item.speakerId,
    })),
    p_template_id: templateId || null,
  });
  if (prepareResult.error) {
    logSupabaseError("speaker_certificate_prepare_failed", prepareResult.error, { activityId, templateId });
    return { message: getSupabaseErrorMessage(prepareResult.error, {
      fallback: "No se pudo preparar la emisión. Actualiza la página e inténtalo nuevamente.",
      messages: {
        ACTIVITY_ARCHIVED: "La actividad está archivada y no admite nuevas emisiones.",
        SPEAKER_DOCUMENT_REQUIRED: "Completa primero el DNI del ponente para emitir o recuperar su certificado.",
        SPEAKER_EMAIL_REQUIRED: "Completa un correo electrónico válido para emitir o recuperar el certificado del ponente.",
        TEMPLATE_NOT_AVAILABLE: "La plantilla seleccionada ya no está disponible.",
        VALIDATION_ERROR: "La selección o los roles no son válidos.",
      },
    }) };
  }
  const parsed = prepareSpeakerCertificateResultSchema.safeParse(prepareResult.data);
  if (!parsed.success) return { message: "La emisión no pudo confirmarse. Actualiza la página antes de reintentar." };

  const pending = [
    ...parsed.data.prepared,
    ...parsed.data.existing.filter((item) => !item.file_ready),
  ];
  const readySpeakerIds = parsed.data.existing.filter((item) => item.file_ready).map((item) => item.speaker_id);
  const processedSpeakerIds = [...readySpeakerIds];
  let issuedCount = 0;
  let failureMessage = "";
  let errorCount = parsed.data.rejected.length;
  for (const item of pending) {
    try {
      await generateSpeakerCertificate(item.certificate_id);
      issuedCount += 1;
      processedSpeakerIds.push(item.speaker_id);
    } catch (error) {
      errorCount += 1;
      failureMessage = error instanceof Error ? error.message : "Revisa los datos del ponente y vuelve a intentar.";
      logSupabaseError("speaker_certificate_generation_failed", error instanceof Error ? error : { message: "Unknown" }, { certificateId: item.certificate_id });
    }
  }
  const existingCount = readySpeakerIds.length;
  return {
    errorCount,
    issuedCount,
    processedSpeakerIds,
    message: errorCount
      ? `${issuedCount} certificados emitidos y ${existingCount} ya existentes. ${errorCount} no pudieron procesarse. ${failureMessage}`
      : `${issuedCount} certificados emitidos y ${existingCount} ya existentes.`,
    success: errorCount === 0,
  };
}
