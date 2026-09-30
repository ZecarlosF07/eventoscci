import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { CERTIFICATE_BUCKET } from "@/features/certificates/constants/certificate.constants";
import type { Database } from "@/lib/supabase/database.types";
import { logSupabaseError } from "@/lib/supabase/supabase-error";

export async function removeCertificateFile(client: SupabaseClient<Database>, filePath: string): Promise<boolean> {
  const { error } = await client.storage.from(CERTIFICATE_BUCKET).remove([filePath]);
  if (error) logSupabaseError("certificate_regeneration_cleanup_failed", error, { filePath });
  return !error;
}
