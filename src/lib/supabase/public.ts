import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getPublicEnv } from "@/lib/env/public-env";
import type { Database } from "@/lib/supabase/database.types";
import { fetchUncached } from "@/lib/supabase/utils/fetch-uncached";

export function createPublicSupabaseClient() {
  const { supabasePublishableKey, supabaseUrl } = getPublicEnv();

  return createClient<Database>(supabaseUrl, supabasePublishableKey, {
    global: { fetch: fetchUncached },
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
