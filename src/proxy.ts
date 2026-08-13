import { type NextRequest, NextResponse } from "next/server";

import { ROUTES } from "@/constants/routes";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { accountAccess, authenticated, response } = await refreshSupabaseSession(request);
  const pathname = request.nextUrl.pathname;
  const isLoginRoute = request.nextUrl.pathname === ROUTES.adminLogin;

  const redirectWithCookies = (destination: string) => {
    const url = new URL(destination, request.url);
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  };

  if (isLoginRoute) return redirectWithCookies(`${ROUTES.login}?next=${encodeURIComponent(ROUTES.admin)}`);

  if (!authenticated) {
    return redirectWithCookies(`${ROUTES.login}?next=${encodeURIComponent(pathname)}`);
  }
  if (!accountAccess) return redirectWithCookies(`${ROUTES.login}?error=not-linked`);
  if (!accountAccess.isActive) return redirectWithCookies(`${ROUTES.login}?error=inactive`);
  if (pathname.startsWith(ROUTES.admin) && accountAccess.role === "student") {
    return redirectWithCookies(ROUTES.campus);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/campus/:path*"],
};
