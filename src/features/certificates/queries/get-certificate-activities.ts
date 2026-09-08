import "server-only";

import { CERTIFICATE_ACTIVITY_PAGE_SIZE } from "@/features/certificates/constants/certificate.constants";
import type {
  CertificateActivityFilters,
  CertificateActivityPage,
} from "@/features/certificates/types/certificate.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCertificateActivities(
  filters: CertificateActivityFilters,
): Promise<CertificateActivityPage> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_certificate_activity_summaries", {
    p_limit: CERTIFICATE_ACTIVITY_PAGE_SIZE,
    p_offset: (filters.page - 1) * CERTIFICATE_ACTIVITY_PAGE_SIZE,
    p_query: filters.query,
    p_type: filters.type,
  });
  if (error) throw new Error("No fue posible consultar las actividades certificables.", { cause: error });
  const activities = (data ?? []).map((activity) => ({
    eligibleCount: Number(activity.eligible_count),
    id: activity.id,
    issuedCount: Number(activity.issued_count),
    title: activity.title,
    type: activity.type,
  }));
  const total = Number(data?.[0]?.total_count ?? 0);
  return {
    activities,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / CERTIFICATE_ACTIVITY_PAGE_SIZE)),
    total,
  };
}
