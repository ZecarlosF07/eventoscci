import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getCertificateServerEnv } from "@/lib/env/server-env";
import type { Database } from "@/lib/supabase/database.types";

export function createServiceRoleSupabaseClient() {
  const { serviceRoleKey, supabaseUrl } = getCertificateServerEnv();
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
