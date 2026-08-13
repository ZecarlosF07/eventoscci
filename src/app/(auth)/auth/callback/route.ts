import { NextResponse } from "next/server";

import { ROUTES } from "@/constants/routes";
import { safeAuthRedirect } from "@/features/auth/utils/safe-auth-redirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requested = url.searchParams.get("next");
  const next = requested === ROUTES.resetPassword
    ? ROUTES.resetPassword
    : safeAuthRedirect(requested, ROUTES.campus);
  if (code) {
    const client = await createServerSupabaseClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL(`${ROUTES.login}?error=confirmation`, url.origin));
}
