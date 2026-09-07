import { certificateAccessTokenSchema, certificateViewRequestSchema } from "@/features/certificates/schemas/certificate-access.schema";
import { recordCertificatePublicAccess } from "@/features/certificates/services/record-certificate-public-access";
import type { CertificateDownloadRouteContext } from "@/features/certificates/types/certificate-route.types";
import { getCertificateRequestMetadata } from "@/features/certificates/utils/certificate-request-metadata";
import { logger } from "@/lib/observability/logger";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export async function POST(request: Request, context: CertificateDownloadRouteContext): Promise<Response> {
  const { token } = await context.params;
  if (!certificateAccessTokenSchema.safeParse(token).success) return new Response(null, { status: 400 });

  const payload = certificateViewRequestSchema.safeParse(await request.json().catch(() => ({})));
  if (!payload.success) return new Response(null, { status: 400 });

  try {
    const result = await recordCertificatePublicAccess(createServiceRoleSupabaseClient(), {
      action: "certificate.public_view",
      ...getCertificateRequestMetadata(request.headers),
      source: payload.data.source,
      token,
    });
    if (result === "not_found") return new Response(null, { status: 404 });
    return new Response(null, { status: 204 });
  } catch (error) {
    logger.warn("public_certificate_view_tracking_failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return new Response(null, { status: 503 });
  }
}
