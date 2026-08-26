import "server-only";

import { CERTIFICATE_BUCKET } from "@/features/certificates/constants/certificate.constants";
import { getCertificateGenerationData } from "@/features/certificates/queries/get-certificate-generation-data";
import { prepareCertificateResultSchema } from "@/features/certificates/schemas/certificate-mutation.schema";
import { storeCertificatePdf } from "@/features/certificates/services/store-certificate-pdf";
import type { CertificateIssueState } from "@/features/certificates/types/certificate.types";
import { deliverNotificationImmediately } from "@/features/notifications/services/process-notifications";
import { getSiteUrl } from "@/lib/env/server-env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/supabase-error";

async function generateAndStoreCertificate(certificateId: string): Promise<void> {
  const client = await createServerSupabaseClient();
  const certificate = await getCertificateGenerationData(certificateId);
  if (!certificate || certificate.status === "revoked") throw new Error("CERTIFICATE_NOT_AVAILABLE");
  if (certificate.file_path) return;

  const siteUrl = getSiteUrl();
  const filePath = await storeCertificatePdf(client, certificate, siteUrl);

  const finalized = await client.rpc("finalize_activity_certificate", {
    p_certificate_id: certificate.id,
    p_file_path: filePath,
    p_public_base_url: siteUrl,
  });
  if (finalized.error) {
    await client.storage.from(CERTIFICATE_BUCKET).remove([filePath]);
    throw new Error("CERTIFICATE_FINALIZE_FAILED", { cause: finalized.error });
  }
  await deliverNotificationImmediately({
    eventType: "activity_certificate_issued",
    relatedEntityId: certificate.id,
    relatedEntityType: "certificate",
  });
}

export async function issueActivityCertificates(
  registrationIds: string[],
  templateId: string,
  condition: string,
): Promise<CertificateIssueState> {
  const client = await createServerSupabaseClient();
  const preparedResult = await client.rpc("prepare_activity_certificates", {
    p_condition: condition,
    p_registration_ids: registrationIds,
    p_template_id: templateId,
  });
  if (preparedResult.error) {
    logSupabaseError("activity_certificate_prepare_failed", preparedResult.error, { templateId });
    return {
      message: getSupabaseErrorMessage(preparedResult.error, {
        fallback: "No se pudo preparar la emisión. Actualiza la página e inténtalo nuevamente.",
        messages: {
          TEMPLATE_NOT_AVAILABLE: "La plantilla seleccionada está inactiva o ya no está disponible. Selecciona otra plantilla.",
          VALIDATION_ERROR: "La selección contiene participantes o condiciones no válidas. Revisa los datos e inténtalo nuevamente.",
        },
      }),
    };
  }
  const parsed = prepareCertificateResultSchema.safeParse(preparedResult.data);
  if (!parsed.success) {
    logSupabaseError("activity_certificate_response_invalid", { message: parsed.error.message }, { templateId });
    return { message: "La emisión no pudo confirmarse. Actualiza la página antes de volver a intentarlo." };
  }

  const pendingIds = [
    ...parsed.data.prepared.map((item) => item.certificate_id),
    ...parsed.data.existing.filter((item) => !item.file_ready).map((item) => item.certificate_id),
  ];
  let issuedCount = 0;
  let errorCount = parsed.data.rejected.length;
  for (const certificateId of pendingIds) {
    try {
      await generateAndStoreCertificate(certificateId);
      issuedCount += 1;
    } catch (error) {
      errorCount += 1;
      logSupabaseError("activity_certificate_generation_failed", error instanceof Error ? error : { message: "Unknown generation error" }, { certificateId });
      const abandoned = await client.rpc("abandon_unfinalized_certificate", { p_certificate_id: certificateId });
      if (abandoned.error) logSupabaseError("activity_certificate_cleanup_failed", abandoned.error, { certificateId });
    }
  }
  const alreadyReady = parsed.data.existing.filter((item) => item.file_ready).length;
  return {
    errorCount,
    issuedCount,
    message: errorCount
      ? `${issuedCount} certificados emitidos y ${alreadyReady} ya existentes. ${errorCount} no pudieron procesarse; revisa que los participantes sigan siendo elegibles y vuelve a intentarlo.`
      : `${issuedCount} certificados emitidos y ${alreadyReady} ya existentes.`,
    success: errorCount === 0,
  };
}
