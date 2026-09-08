import "server-only";

import { CERTIFICATE_ACTIVITY_PAGE_SIZE } from "@/features/certificates/constants/certificate.constants";
import type {
  CertificateActivityFilters,
  CertificateActivityPage,
  CertificateActivityOption,
} from "@/features/certificates/types/certificate.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getLegacyCertificateActivities(
  filters: CertificateActivityFilters,
): Promise<CertificateActivityPage> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_certificate_activity_summaries", {});
  if (error) throw new Error("No fue posible consultar las actividades certificables.", { cause: error });

  const query = filters.query?.toLocaleLowerCase("es-PE");
  const filtered: CertificateActivityOption[] = (data ?? [])
    .filter((activity) => !filters.type || activity.type === filters.type)
    .filter((activity) => !query || activity.title.toLocaleLowerCase("es-PE").includes(query))
    .map((activity) => ({
      eligibleCount: Number(activity.eligible_count),
      id: activity.id,
      issuedCount: Number(activity.issued_count),
      title: activity.title,
      type: activity.type,
    }));
  const offset = (filters.page - 1) * CERTIFICATE_ACTIVITY_PAGE_SIZE;

  return {
    activities: filtered.slice(offset, offset + CERTIFICATE_ACTIVITY_PAGE_SIZE),
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(filtered.length / CERTIFICATE_ACTIVITY_PAGE_SIZE)),
    total: filtered.length,
  };
}
