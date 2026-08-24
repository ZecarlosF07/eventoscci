import "server-only";

import { getCertificateGenerationDataWithClient } from "@/features/certificates/queries/get-certificate-generation-data";
import { storeCertificatePdf } from "@/features/certificates/services/store-certificate-pdf";
import { deliverNotificationImmediately } from "@/features/notifications/services/process-notifications";
import { getSiteUrl } from "@/lib/env/server-env";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export async function issueCourseCertificate(certificateId: string): Promise<void> {
  const client = createServiceRoleSupabaseClient();
  const certificate = await getCertificateGenerationDataWithClient(client, certificateId);
  if (!certificate || certificate.certificate_type !== "course" || certificate.status === "revoked") {
    throw new Error("CERTIFICATE_NOT_AVAILABLE");
  }
  if (certificate.file_path) return;
  const siteUrl = getSiteUrl();
  const filePath = await storeCertificatePdf(client, certificate, siteUrl);
  const finalized = await client.rpc("finalize_course_certificate", {
    p_certificate_id: certificate.id,
    p_file_path: filePath,
    p_public_base_url: siteUrl,
  });
  if (finalized.error) throw new Error("CERTIFICATE_FINALIZE_FAILED", { cause: finalized.error });
  await deliverNotificationImmediately({
    eventType: "course_certificate_issued",
    relatedEntityId: certificate.id,
    relatedEntityType: "certificate",
  });
}
