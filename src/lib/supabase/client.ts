import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnv } from "@/lib/env/public-env";
import type { Database } from "@/lib/supabase/database.types";

export function createBrowserSupabaseClient() {
  const { supabasePublishableKey, supabaseUrl } = getPublicEnv();

  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
}
