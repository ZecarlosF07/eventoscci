import "server-only";

import { certificatePublicSchema } from "@/features/certificates/schemas/certificate.schema";
import type { CertificatePublicData } from "@/features/certificates/types/certificate.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getPublicCertificate(token: string): Promise<CertificatePublicData | null> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_public_certificate", { p_access_token: token });
  if (error || !data) return null;
  const parsed = certificatePublicSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}
