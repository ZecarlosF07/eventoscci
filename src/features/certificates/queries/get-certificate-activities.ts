import "server-only";

import type { CertificateActivityOption } from "@/features/certificates/types/certificate.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCertificateActivities(): Promise<CertificateActivityOption[]> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_certificate_activity_summaries");
  if (error) throw new Error("No fue posible consultar las actividades certificables.", { cause: error });
  return (data ?? []).map((activity) => ({
    eligibleCount: Number(activity.eligible_count),
    id: activity.id,
    issuedCount: Number(activity.issued_count),
    title: activity.title,
    type: activity.type,
  }));
}
