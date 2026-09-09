import { CERTIFICATE_BUCKET } from "@/features/certificates/constants/certificate.constants";
import { recordCertificatePublicAccess } from "@/features/certificates/services/record-certificate-public-access";
import type { CertificateDownloadRouteContext } from "@/features/certificates/types/certificate-route.types";
import { getCertificateAccessSource } from "@/features/certificates/utils/certificate-access-source";
import { getCertificateRequestMetadata } from "@/features/certificates/utils/certificate-request-metadata";
import { logger } from "@/lib/observability/logger";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export async function GET(request: Request, context: CertificateDownloadRouteContext): Promise<Response> {
  let client;
  try {
    client = createServiceRoleSupabaseClient();
  } catch {
    return new Response("Descarga no configurada", { status: 503 });
  }
  const { token } = await context.params;
  const fileResult = await client.rpc("get_public_certificate_file", { p_access_token: token });
  if (fileResult.error || !fileResult.data) return new Response("Certificado no disponible", { status: 404 });
  const signed = await client.storage.from(CERTIFICATE_BUCKET).createSignedUrl(fileResult.data, 60);
  if (signed.error) return new Response("Certificado no disponible", { status: 404 });
  const requestUrl = new URL(request.url);
  try {
    await recordCertificatePublicAccess(client, {
      action: "certificate.public_download",
      ...getCertificateRequestMetadata(request.headers),
      source: getCertificateAccessSource(requestUrl.search, request.headers.get("referer") ?? "", requestUrl.origin),
      token,
    });
  } catch (error) {
    logger.warn("public_certificate_download_tracking_failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
  }
  return new Response(null, {
    headers: {
      Location: signed.data.signedUrl,
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
    status: 302,
  });
}
