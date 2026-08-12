import { type NextRequest, NextResponse } from "next/server";

import { ROUTES } from "@/constants/routes";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { authenticated, response } = await refreshSupabaseSession(request);
  const isLoginRoute = request.nextUrl.pathname === ROUTES.adminLogin;

  if (!authenticated && !isLoginRoute) {
    const loginUrl = new URL(ROUTES.adminLogin, request.url);
    loginUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
