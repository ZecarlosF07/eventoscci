import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getPublicEnv } from "@/lib/env/public-env";
import type { Database } from "@/lib/supabase/database.types";

export function createPublicSupabaseClient() {
  const { supabasePublishableKey, supabaseUrl } = getPublicEnv();

  return createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
