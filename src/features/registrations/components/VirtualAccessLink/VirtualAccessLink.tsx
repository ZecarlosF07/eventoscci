"use client";

import { useState } from "react";

import type { VirtualAccessLinkProps } from "@/features/registrations/components/VirtualAccessLink/types/virtual-access-link.types";

export function VirtualAccessLink({ url }: VirtualAccessLinkProps) {
  const [copyMessage, setCopyMessage] = useState("");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopyMessage("Enlace copiado.");
    } catch {
      setCopyMessage("No se pudo copiar. Selecciona el enlace y cópialo manualmente.");
    }
  }

  return (
    <div className="mt-4 min-w-0 rounded-2xl border-2 border-cci-lime bg-cci-950 p-4 shadow-lg sm:p-5">
      <p className="text-lg font-bold text-cci-lime">Tu enlace de acceso</p>
      <p className="mt-1 text-sm text-white">
        Si el botón no funciona, copia este enlace y pégalo en tu navegador.
      </p>
      <a
        className="mt-4 block min-w-0 rounded-xl bg-white p-4 text-base font-bold leading-relaxed text-cci-950 underline decoration-cci-600 underline-offset-4 break-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime"
        href={url}
        rel="noreferrer"
        target="_blank"
      >
        {url}
      </a>
      <button
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-cci-lime px-5 py-2 text-sm font-bold text-cci-950 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
        onClick={copyLink}
        type="button"
      >
        Copiar enlace
      </button>
      <p aria-live="polite" className="mt-2 text-sm text-white" role="status">
        {copyMessage}
      </p>
    </div>
  );
}
