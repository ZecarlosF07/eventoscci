"use client";

import { useState } from "react";

import type { CopyActivityLinkProps } from "@/features/activities/components/CopyActivityLink/types/copy-activity-link.types";
import { getPublicActivityRoute } from "@/features/activities/utils/activity-routes";

export function CopyActivityLink({ slug, type }: CopyActivityLinkProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${getPublicActivityRoute(type, slug)}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      className="inline-flex min-h-10 items-center rounded-lg border border-cci-300 px-3 font-semibold text-cci-950 hover:bg-cci-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-700"
      onClick={handleCopy}
      type="button"
    >
      {copied ? "Enlace copiado" : "Copiar enlace"}
    </button>
  );
}
