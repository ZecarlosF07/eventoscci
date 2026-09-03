"use server";

import { headers } from "next/headers";

import { getCurrentAccount } from "@/features/auth/queries/get-current-account";
import { getCertificateRecommendationsSafely } from "@/features/certificates/queries/get-certificate-recommendations";
import { publicCertificateSearchResultSchema } from "@/features/certificates/schemas/public-certificate-search.schema";
import type { PublicCertificateSearchState } from "@/features/certificates/types/certificate.types";
import { getCertificateRequestMetadata } from "@/features/certificates/utils/certificate-request-metadata";
import { logger } from "@/lib/observability/logger";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import { logSupabaseError } from "@/lib/supabase/supabase-error";

export async function searchPublicCertificates(
  _previousState: PublicCertificateSearchState,
  formData: FormData,
): Promise<PublicCertificateSearchState> {
  const documentNumberValue = formData.get("document_number");
  const documentNumber = typeof documentNumberValue === "string" ? documentNumberValue : "";
  const [requestHeaders, account] = await Promise.all([headers(), getCurrentAccount()]);
  const metadata = getCertificateRequestMetadata(requestHeaders);

  try {
    const client = createServiceRoleSupabaseClient();
    const { data, error } = await client.rpc("search_public_certificates_by_dni", {
      p_actor_user_id: account?.userId,
      p_document_number: documentNumber,
      p_ip_address: metadata.ipAddress ?? undefined,
      p_user_agent: metadata.userAgent ?? undefined,
    });
    if (error) {
      logSupabaseError("public_certificate_search_failed", error);
      return { certificates: [], message: "No pudimos consultar los certificados. Inténtalo nuevamente.", recommendations: [], status: "error" };
    }

    const parsed = publicCertificateSearchResultSchema.safeParse(data);
    if (!parsed.success) {
      logger.error("public_certificate_search_invalid_response", {
        issueCount: parsed.error.issues.length,
      });
      return { certificates: [], message: "La consulta devolvió una respuesta inesperada.", recommendations: [], status: "error" };
    }
    if (parsed.data.status === "invalid") {
      return { certificates: [], message: "El DNI debe tener exactamente 8 dígitos.", recommendations: [], status: "invalid" };
    }
    if (parsed.data.status === "rate_limited") {
      return { certificates: [], message: "Se realizaron demasiadas consultas desde esta conexión. Inténtalo nuevamente en 10 minutos.", recommendations: [], status: "rate_limited" };
    }
    if (parsed.data.status === "not_found") {
      return { certificates: [], message: "No encontramos certificados emitidos para este DNI.", recommendations: [], status: "not_found" };
    }

    const recommendations = await getCertificateRecommendationsSafely(parsed.data.recommendation_context);
    return {
      certificates: parsed.data.certificates,
      participantName: parsed.data.participant_name ?? undefined,
      recommendations,
      status: "found",
    };
  } catch (error) {
    logger.error("public_certificate_search_unavailable", {
      errorMessage: error instanceof Error ? error.message : "unknown",
    });
    return { certificates: [], message: "La consulta pública no está disponible temporalmente.", recommendations: [], status: "error" };
  }
}
