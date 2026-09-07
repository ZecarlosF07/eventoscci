import type { CertificatePublicAccessSource } from "@/features/certificates/types/certificate-access.types";

export function getCertificateAccessSource(search: string, referrer: string, origin: string): CertificatePublicAccessSource {
  const requestedSource = new URLSearchParams(search).get("origen");
  if (requestedSource === "correo") return "email";

  try {
    const referrerUrl = new URL(referrer);
    if (referrerUrl.searchParams.get("origen") === "correo") return "email";
    if (referrerUrl.origin === origin && referrerUrl.pathname === "/certificados") return "public_search";
  } catch {
    return "direct";
  }

  return "direct";
}
