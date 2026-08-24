import "server-only";

import { CERTIFICATE_BUCKET } from "@/features/certificates/constants/certificate.constants";
import { getCertificateGenerationData } from "@/features/certificates/queries/get-certificate-generation-data";
import { prepareCertificateResultSchema } from "@/features/certificates/schemas/certificate-mutation.schema";
import { storeCertificatePdf } from "@/features/certificates/services/store-certificate-pdf";
import type { CertificateIssueState } from "@/features/certificates/types/certificate.types";
import { getSiteUrl } from "@/lib/env/server-env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
  if (!finalized.error) return;
  await client.storage.from(CERTIFICATE_BUCKET).remove([filePath]);
  throw new Error("CERTIFICATE_FINALIZE_FAILED", { cause: finalized.error });
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
  if (preparedResult.error) return { message: "No fue posible validar la emisión." };
  const parsed = prepareCertificateResultSchema.safeParse(preparedResult.data);
  if (!parsed.success) return { message: "La respuesta de emisión no tiene el formato esperado." };

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
    } catch {
      errorCount += 1;
      await client.rpc("abandon_unfinalized_certificate", { p_certificate_id: certificateId });
    }
  }
  const alreadyReady = parsed.data.existing.filter((item) => item.file_ready).length;
  return {
    errorCount,
    issuedCount,
    message: `${issuedCount} certificados emitidos, ${alreadyReady} ya existentes y ${errorCount} no procesados.`,
    success: errorCount === 0,
  };
}
