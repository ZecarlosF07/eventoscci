import "server-only";

import { CERTIFICATE_ACTIVITY_PAGE_SIZE } from "@/features/certificates/constants/certificate.constants";
import type { CertificateActivityFilters } from "@/features/certificates/types/certificate.types";
import type { SpeakerCertificateActivityPage } from "@/features/certificates/types/speaker-certificate.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getSpeakerCertificateActivities(
  filters: CertificateActivityFilters,
): Promise<SpeakerCertificateActivityPage> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_speaker_certificate_activity_summaries", {
    p_limit: CERTIFICATE_ACTIVITY_PAGE_SIZE,
    p_offset: (filters.page - 1) * CERTIFICATE_ACTIVITY_PAGE_SIZE,
    p_query: filters.query,
    p_type: filters.type,
  });
  if (error) throw new Error("No fue posible consultar las actividades con ponentes.", { cause: error });
  const activities = (data ?? []).map((item) => ({
    id: item.id,
    issuedCount: Number(item.issued_count),
    pendingCount: Number(item.pending_count),
    speakerCount: Number(item.speaker_count),
    title: item.title,
    type: item.type,
  }));
  const total = Number(data?.[0]?.total_count ?? 0);
  return {
    activities,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / CERTIFICATE_ACTIVITY_PAGE_SIZE)),
    total,
  };
}
