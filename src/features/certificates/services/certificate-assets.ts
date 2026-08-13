import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { CERTIFICATE_BUCKET } from "@/features/certificates/constants/certificate.constants";
import type { CertificateDocumentSigner, CertificateGenerationData } from "@/features/certificates/types/certificate.types";
import type { Database } from "@/lib/supabase/database.types";

async function downloadAsset(client: SupabaseClient<Database>, assetPath: string): Promise<Uint8Array> {
  const { data, error } = await client.storage.from(CERTIFICATE_BUCKET).download(assetPath);
  if (error) throw new Error("No fue posible descargar un recurso de la plantilla.", { cause: error });
  return new Uint8Array(await data.arrayBuffer());
}

export async function loadCertificateDocumentAssets(
  client: SupabaseClient<Database>,
  certificate: CertificateGenerationData,
): Promise<{ backgroundBytes?: Uint8Array; signers: CertificateDocumentSigner[] }> {
  const backgroundBytes = certificate.template.background_path
    ? await downloadAsset(client, certificate.template.background_path)
    : undefined;
  const signers = await Promise.all(certificate.template.signers.map(async (signer) => ({
    signature_path: signer.signature_path,
    signer_name: signer.signer_name,
    signer_title: signer.signer_title,
    sort_order: signer.sort_order,
    signatureBytes: signer.signature_path ? await downloadAsset(client, signer.signature_path) : undefined,
  })));
  return { backgroundBytes, signers };
}
