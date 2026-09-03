import "server-only";

import { ACTIVITY_LIST_SELECT } from "@/features/activities/queries/get-public-activities";
import type { ActivityListItem } from "@/features/activities/types/activity.types";
import type { CertificateRecommendationContext } from "@/features/certificates/types/certificate.types";
import { selectCertificateRecommendationCandidates } from "@/features/certificates/utils/select-certificate-recommendations";
import { registrationAvailabilitySchema } from "@/features/registrations/schemas/registration.schema";
import { logger } from "@/lib/observability/logger";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCertificateRecommendations(
  context: CertificateRecommendationContext | null,
): Promise<ActivityListItem[]> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.from("activities")
    .select(ACTIVITY_LIST_SELECT)
    .eq("status", "published")
    .is("deleted_at", null)
    .not("published_at", "is", null)
    .is("activity_dates.deleted_at", null);
  if (error) throw new Error("No fue posible cargar las recomendaciones.", { cause: error });

  const candidates = selectCertificateRecommendationCandidates({
    activities: data,
    context,
  });
  const availability = await Promise.all(candidates.map((activity) =>
    client.rpc("get_activity_registration_availability", { p_activity_id: activity.id }),
  ));

  return candidates.filter((_, index) => {
    const parsed = registrationAvailabilitySchema.safeParse(availability[index].data);
    return !availability[index].error && parsed.success && parsed.data.is_open;
  }).slice(0, 3);
}

export async function getCertificateRecommendationsSafely(
  context: CertificateRecommendationContext | null,
): Promise<ActivityListItem[]> {
  try {
    return await getCertificateRecommendations(context);
  } catch (error) {
    logger.warn("public_certificate_recommendations_failed", {
      errorMessage: error instanceof Error ? error.message : "unknown",
    });
    return [];
  }
}
