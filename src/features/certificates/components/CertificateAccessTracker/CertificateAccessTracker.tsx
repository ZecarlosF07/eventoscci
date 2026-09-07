"use client";

import { useEffect } from "react";

import type { CertificateAccessTrackerProps } from "@/features/certificates/components/CertificateAccessTracker/types/certificate-access-tracker.types";
import { getCertificateAccessSource } from "@/features/certificates/utils/certificate-access-source";

export function CertificateAccessTracker({ token }: CertificateAccessTrackerProps) {
  useEffect(() => {
    const storageKey = `certificate-view:${token}`;
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, "pending");

    const source = getCertificateAccessSource(window.location.search, document.referrer, window.location.origin);
    void fetch(`/api/certificates/${encodeURIComponent(token)}/view`, {
      body: JSON.stringify({ source }),
      headers: { "content-type": "application/json" },
      keepalive: true,
      method: "POST",
    }).then((response) => {
      if (!response.ok) window.sessionStorage.removeItem(storageKey);
      else window.sessionStorage.setItem(storageKey, "recorded");
    }).catch(() => window.sessionStorage.removeItem(storageKey));
  }, [token]);

  return null;
}
