import "server-only";

import type { CertificateActivityOption } from "@/features/certificates/types/certificate.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCertificateActivities(): Promise<CertificateActivityOption[]> {
  const client = await createServerSupabaseClient();
  const [activityResult, registrationResult, certificateResult] = await Promise.all([
    client.from("activities").select("id, title, type").is("deleted_at", null).order("updated_at", { ascending: false }).limit(500),
    client.from("registrations").select("id, activity_id, status, attendance(status)").is("deleted_at", null).is("attendance.deleted_at", null).limit(10000),
    client.from("certificates").select("registration_id").eq("certificate_type", "activity").is("deleted_at", null).limit(10000),
  ]);
  const error = activityResult.error ?? registrationResult.error ?? certificateResult.error;
  if (error) throw new Error("No fue posible consultar las actividades certificables.", { cause: error });

  const issuedIds = new Set((certificateResult.data ?? []).map((item) => item.registration_id).filter((id): id is string => Boolean(id)));
  return (activityResult.data ?? []).map((activity) => {
    const registrations = (registrationResult.data ?? []).filter((item) => item.activity_id === activity.id);
    return {
      ...activity,
      eligibleCount: registrations.filter((item) => item.status === "confirmed" && item.attendance.some((attendance) => attendance.status === "attended") && !issuedIds.has(item.id)).length,
      issuedCount: registrations.filter((item) => issuedIds.has(item.id)).length,
    };
  });
}
