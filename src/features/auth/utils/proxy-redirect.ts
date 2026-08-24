import { type NextRequest, NextResponse } from "next/server";

export function redirectWithSupabaseCookies(
  request: NextRequest,
  response: NextResponse,
  destination: string,
): NextResponse {
  const redirectResponse = NextResponse.redirect(new URL(destination, request.url));
  response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
  return redirectResponse;
}
