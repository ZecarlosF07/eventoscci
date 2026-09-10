import "server-only";

import { CERTIFICATE_BUCKET } from "@/features/certificates/constants/certificate.constants";
import { getCertificateGenerationDataWithClient } from "@/features/certificates/queries/get-certificate-generation-data";
import { storeCertificatePdf } from "@/features/certificates/services/store-certificate-pdf";
import type {
  CertificateRegenerationOutcome,
  CertificateRegenerationState,
} from "@/features/certificates/types/certificate.types";
import { getSiteUrl } from "@/lib/env/server-env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logSupabaseError } from "@/lib/supabase/supabase-error";

async function removeFile(filePath: string): Promise<boolean> {
  const client = await createServerSupabaseClient();
  const { error } = await client.storage.from(CERTIFICATE_BUCKET).remove([filePath]);
  if (error) logSupabaseError("certificate_regeneration_cleanup_failed", error, { filePath });
  return !error;
}

async function regenerateCertificate(
  certificateId: string,
  personId: string,
  participantName: string,
): Promise<CertificateRegenerationOutcome> {
  const client = await createServerSupabaseClient();
  const certificate = await getCertificateGenerationDataWithClient(client, certificateId);
  if (!certificate || certificate.status !== "issued") throw new Error("CERTIFICATE_NOT_AVAILABLE");

  const oldFilePath = certificate.file_path;
  if (oldFilePath && !oldFilePath.startsWith(`issued/${certificate.id}/`)) {
    throw new Error("CERTIFICATE_FILE_PATH_INVALID");
  }
  const newFilePath = `issued/${certificate.id}/${certificate.certificate_code}-${crypto.randomUUID()}.pdf`;
  await storeCertificatePdf(client, { ...certificate, participant_name_snapshot: participantName }, getSiteUrl(), newFilePath);

  const replaced = await client.rpc("replace_certificate_document", {
    p_certificate_id: certificate.id,
    p_expected_file_path: oldFilePath ?? "",
    p_expected_participant_name: participantName,
    p_expected_person_id: personId,
    p_new_file_path: newFilePath,
  });
  if (replaced.error) {
    await removeFile(newFilePath);
    throw new Error("CERTIFICATE_REPLACEMENT_FAILED", { cause: replaced.error });
  }

  const cleanupSucceeded = !oldFilePath || oldFilePath === newFilePath || await removeFile(oldFilePath);
  return { cleanupWarning: !cleanupSucceeded };
}

export async function regenerateParticipantCertificates(
  personId: string,
): Promise<CertificateRegenerationState> {
  const client = await createServerSupabaseClient();
  const personResult = await client.from("people")
    .select("id, first_names, last_names")
    .eq("id", personId)
    .is("deleted_at", null)
    .maybeSingle();
  if (personResult.error || !personResult.data) {
    return { message: "El participante ya no está disponible." };
  }

  const participantName = `${personResult.data.first_names} ${personResult.data.last_names}`.trim();
  const certificateResult = await client.from("certificates")
    .select(`
      id, certificate_code, certificate_type,
      registration:registrations!certificates_registration_id_fkey(
        activity:activities!inner(status)
      )
    `)
    .eq("person_id", personId)
    .eq("status", "issued")
    .is("deleted_at", null)
    .neq("participant_name_snapshot", participantName)
    .order("issued_at", { ascending: true });
  if (certificateResult.error) {
    logSupabaseError("participant_certificates_query_failed", certificateResult.error, { personId });
    return { message: "No fue posible consultar los certificados por actualizar." };
  }

  const certificates = (certificateResult.data ?? []).filter(
    (certificate) => certificate.certificate_type === "course" || certificate.registration?.activity.status !== "archived",
  );
  if (!certificates.length) {
    return { message: "Todos los certificados vigentes ya muestran el nombre actual.", success: true };
  }

  let cleanupWarningCount = 0;
  let errorCount = 0;
  const failedCertificateCodes: string[] = [];
  let regeneratedCount = 0;
  for (const certificate of certificates) {
    try {
      const outcome = await regenerateCertificate(certificate.id, personId, participantName);
      regeneratedCount += 1;
      if (outcome.cleanupWarning) cleanupWarningCount += 1;
    } catch (error) {
      errorCount += 1;
      failedCertificateCodes.push(certificate.certificate_code);
      logSupabaseError("certificate_regeneration_failed", error instanceof Error ? error : { message: "Unknown regeneration error" }, { certificateId: certificate.id, personId });
    }
  }

  const warning = errorCount > 0 || cleanupWarningCount > 0;
  const details = cleanupWarningCount
    ? ` ${cleanupWarningCount} archivos anteriores requieren limpieza posterior.`
    : "";
  const failures = failedCertificateCodes.length
    ? ` No pudieron actualizarse: ${failedCertificateCodes.join(", ")}.`
    : "";
  const message = errorCount
    ? `${regeneratedCount} certificados regenerados y ${errorCount} pendientes por error.${failures}${details}`
    : cleanupWarningCount
      ? `${regeneratedCount} certificados regenerados correctamente.${details}`
      : `${regeneratedCount} certificados regenerados correctamente.`;
  return {
    cleanupWarningCount,
    errorCount,
    failedCertificateCodes,
    message,
    regeneratedCount,
    success: !warning,
    warning,
  };
}
