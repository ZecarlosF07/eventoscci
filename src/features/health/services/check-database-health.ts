import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getPublicEnv } from "@/lib/env/public-env";
import type { Database } from "@/lib/supabase/database.types";

export async function checkDatabaseHealth(): Promise<boolean> {
  const { supabasePublishableKey, supabaseUrl } = getPublicEnv();
  const client = createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await client
    .from("categories")
    .select("id", { count: "exact", head: true });

  return error === null;
}
