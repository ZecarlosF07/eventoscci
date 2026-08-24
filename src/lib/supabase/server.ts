import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getPublicEnv } from "@/lib/env/public-env";
import type { Database } from "@/lib/supabase/database.types";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const { supabasePublishableKey, supabaseUrl } = getPublicEnv();

  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          console.warn("No fue posible persistir cookies desde el componente de servidor.");
        }
      },
    },
  });
}
