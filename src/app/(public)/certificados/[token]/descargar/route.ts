import { CERTIFICATE_BUCKET } from "@/features/certificates/constants/certificate.constants";
import type { CertificateDownloadRouteContext } from "@/features/certificates/types/certificate-route.types";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export async function GET(_request: Request, context: CertificateDownloadRouteContext): Promise<Response> {
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
  return Response.redirect(signed.data.signedUrl, 302);
}
