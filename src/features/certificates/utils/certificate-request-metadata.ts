import { isIP } from "node:net";

function validIp(value: string | null): string | null {
  if (!value) return null;
  const candidate = value.split(",")[0]?.trim() ?? "";
  return isIP(candidate) ? candidate : null;
}

export function getCertificateRequestMetadata(requestHeaders: Headers) {
  const ipAddress = validIp(requestHeaders.get("x-forwarded-for"))
    ?? validIp(requestHeaders.get("x-real-ip"));
  return {
    ipAddress,
    userAgent: requestHeaders.get("user-agent")?.slice(0, 500) ?? null,
  };
}
