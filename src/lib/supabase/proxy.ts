import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getPublicEnv } from "@/lib/env/public-env";
import type { AccountAccess } from "@/features/auth/types/auth.types";
import type { Database } from "@/lib/supabase/database.types";

export async function refreshSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { supabasePublishableKey, supabaseUrl } = getPublicEnv();
  const client = createServerClient<Database>(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, options, value }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );
  const { data } = await client.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  let accountAccess: AccountAccess | null = null;
  if (userId) {
    const accountResult = await client.from("user_accounts")
      .select("role, is_active, deleted_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (accountResult.data) accountAccess = {
      isActive: accountResult.data.is_active && accountResult.data.deleted_at === null,
      role: accountResult.data.role,
    };
  }

  return {
    accountAccess,
    authenticated: Boolean(userId),
    response,
  };
}
