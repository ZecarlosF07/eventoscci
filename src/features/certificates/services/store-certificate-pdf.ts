import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { CERTIFICATE_BUCKET } from "@/features/certificates/constants/certificate.constants";
import { loadCertificateDocumentAssets } from "@/features/certificates/services/certificate-assets";
import { generateCertificatePdf } from "@/features/certificates/services/generate-certificate-pdf";
import type { CertificateGenerationData } from "@/features/certificates/types/certificate.types";
import { certificateTemplateShowsDate } from "@/features/certificates/utils/certificate-template-config";
import type { Database } from "@/lib/supabase/database.types";

export async function storeCertificatePdf(
  client: SupabaseClient<Database>,
  certificate: CertificateGenerationData,
  siteUrl: string,
): Promise<string> {
  const assets = await loadCertificateDocumentAssets(client, certificate);
  const pdf = await generateCertificatePdf({
    academicHours: certificate.academic_hours_snapshot,
    accessUrl: `${siteUrl}/certificados/${certificate.access_token}`,
    backgroundBytes: assets.backgroundBytes,
    certificateCode: certificate.certificate_code,
    certificateType: certificate.certificate_type,
    condition: certificate.condition_snapshot,
    dateText: certificate.certificate_type === "course" || !certificateTemplateShowsDate(certificate.template.template_config)
      ? null
      : certificate.date_text_snapshot,
    participantName: certificate.participant_name_snapshot,
    signers: assets.signers,
    title: certificate.title_snapshot,
  });
  const filePath = `issued/${certificate.id}/${certificate.certificate_code}.pdf`;
  const upload = await client.storage.from(CERTIFICATE_BUCKET).upload(filePath, pdf, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (upload.error) throw new Error("CERTIFICATE_UPLOAD_FAILED", { cause: upload.error });
  return filePath;
}
