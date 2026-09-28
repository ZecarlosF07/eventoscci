"use client";
import { useState } from "react";
import type { CopyBillingProps } from "@/features/billing/types/billing.types";

export function CopyBilling({ text }: CopyBillingProps) {
  const [message, setMessage] = useState("");
  async function copy() {
    try { await navigator.clipboard.writeText(text); setMessage("Datos copiados."); }
    catch { setMessage("No se pudo copiar. Selecciona el texto y cópialo manualmente."); }
  }
  return <div><button type="button" onClick={copy} className="min-h-11 rounded-xl border border-cci-200 px-4 font-semibold text-cci-800">Copiar datos</button><p role="status" aria-live="polite" className="mt-1 text-sm text-slate-600">{message}</p></div>;
}
