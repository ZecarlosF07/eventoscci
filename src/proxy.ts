import type { NextRequest } from "next/server";

import { ROUTES } from "@/constants/routes";
import { redirectWithSupabaseCookies } from "@/features/auth/utils/proxy-redirect";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { accountAccess, authenticated, response } = await refreshSupabaseSession(request);
  const pathname = request.nextUrl.pathname;
  const isAdminLogin = pathname === ROUTES.adminLogin;
  const isAdminRoute = pathname === ROUTES.admin || pathname.startsWith(`${ROUTES.admin}/`);

  if (isAdminLogin) {
    if (!authenticated || !accountAccess?.isActive) return response;
    const destination = accountAccess.role === "student" ? ROUTES.campus : ROUTES.admin;
    return redirectWithSupabaseCookies(request, response, destination);
  }

  if (!authenticated) {
    const loginRoute = isAdminRoute ? ROUTES.adminLogin : ROUTES.login;
    return redirectWithSupabaseCookies(request, response, `${loginRoute}?next=${encodeURIComponent(pathname)}`);
  }
  if (!accountAccess) {
    const destination = isAdminRoute ? `${ROUTES.adminLogin}?error=unauthorized` : `${ROUTES.login}?error=not-linked`;
    return redirectWithSupabaseCookies(request, response, destination);
  }
  if (!accountAccess.isActive) {
    const destination = isAdminRoute ? `${ROUTES.adminLogin}?error=unauthorized` : `${ROUTES.login}?error=inactive`;
    return redirectWithSupabaseCookies(request, response, destination);
  }
  if (isAdminRoute && accountAccess.role === "student") {
    return redirectWithSupabaseCookies(request, response, ROUTES.campus);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/campus/:path*"],
};
