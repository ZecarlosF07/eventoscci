import "server-only";

import { certificateBatchStatusSchema } from "@/features/certificates/schemas/certificate-batch.schema";
import type { CertificateBatchStatus } from "@/features/certificates/types/certificate-batch.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCertificateBatchStatus(activityId: string): Promise<CertificateBatchStatus | null> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_activity_certificate_batch", { p_activity_id: activityId });
  if (error) throw new Error("No fue posible consultar el avance de emisión.", { cause: error });
  if (data === null) return null;
  const batch = certificateBatchStatusSchema.parse(data);
  if (!batch.errors.length) return batch;
  const { data: registrations, error: registrationError } = await client.from("registrations")
    .select("id, registration_code").in("id", batch.errors.map((item) => item.registration_id));
  if (registrationError) throw new Error("No fue posible consultar los casos pendientes de la tanda.", { cause: registrationError });
  const codes = new Map((registrations ?? []).map((item) => [item.id, item.registration_code]));
  return { ...batch, errors: batch.errors.map((item) => ({ ...item, registration_code: codes.get(item.registration_id) })) };
}
