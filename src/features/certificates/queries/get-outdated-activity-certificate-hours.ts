import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

export function getOutdatedActivityCertificateHoursQuery(
  client: SupabaseClient<Database>,
  activityId: string,
  academicHours: number,
  countOnly = false,
) {
  return client.from("certificates").select(`
    id, access_token, academic_hours_snapshot, certificate_code, certificate_type,
    condition_snapshot, date_text_snapshot, file_path, participant_name_snapshot,
    status, template_id, title_snapshot,
    registration:registrations!certificates_registration_id_fkey!inner(activity_id, deleted_at)
  `, { count: "exact", head: countOnly }).eq("registration.activity_id", activityId).is("registration.deleted_at", null)
    .eq("certificate_type", "activity").eq("status", "issued").is("deleted_at", null)
    .not("file_path", "is", null).or(`academic_hours_snapshot.is.null,academic_hours_snapshot.neq.${academicHours}`);
}

export async function countOutdatedActivityCertificateHours(client: SupabaseClient<Database>, activityId: string, academicHours: number | null) {
  if (academicHours === null || academicHours <= 0) return 0;
  const result = await getOutdatedActivityCertificateHoursQuery(client, activityId, academicHours, true);
  if (result.error) throw new Error("No fue posible contar los certificados por corregir.", { cause: result.error });
  return result.count ?? 0;
}
