import "server-only";

import { timingSafeEqual } from "node:crypto";

import { getNotificationCronServerEnv } from "@/lib/env/server-env";

function safelyMatches(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  if (valueBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(valueBuffer, expectedBuffer);
}

export function isNotificationCronAuthorized(request: Request): boolean {
  const authorization = request.headers.get("authorization") ?? "";
  const providedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  const { notificationCronSecret } = getNotificationCronServerEnv();
  return Boolean(providedSecret) && safelyMatches(providedSecret, notificationCronSecret);
}
