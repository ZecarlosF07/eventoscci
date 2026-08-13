import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { ROUTES } from "@/constants/routes";
import { safeAuthRedirect } from "@/features/auth/utils/safe-auth-redirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const requested = url.searchParams.get("next");
  const next = requested === ROUTES.resetPassword
    ? ROUTES.resetPassword
    : safeAuthRedirect(requested, ROUTES.campus);
  const client = await createServerSupabaseClient();
  const result = tokenHash && type
    ? await client.auth.verifyOtp({ token_hash: tokenHash, type })
    : code
      ? await client.auth.exchangeCodeForSession(code)
      : { error: new Error("Missing confirmation credentials") };
  if (!result.error) return NextResponse.redirect(new URL(next, url.origin));
  return NextResponse.redirect(new URL(`${ROUTES.login}?error=confirmation`, url.origin));
}
