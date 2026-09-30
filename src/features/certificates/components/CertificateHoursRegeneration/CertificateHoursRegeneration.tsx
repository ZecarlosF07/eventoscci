"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/Button";
import { regenerateActivityCertificateHoursAction } from "@/features/certificates/mutations/certificate.actions";
import type { CertificateHoursRegenerationProps } from "@/features/certificates/types/certificate-hours.types";

export function CertificateHoursRegeneration({ academicHours, activityId }: CertificateHoursRegenerationProps) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const validHours = academicHours !== null && academicHours > 0;

  async function regenerate() {
    if (!validHours || academicHours === null) return;
    setPending(true);
    let total = 0;
    let warnings = 0;
    try {
      let hasMore = true;
      while (hasMore) {
        const result = await regenerateActivityCertificateHoursAction(activityId, academicHours);
        total += result.regeneratedCount ?? 0;
        warnings += result.cleanupWarningCount ?? 0;
        setMessage(`${total} certificados corregidos.${result.success ? "" : ` ${result.message}`}`);
        hasMore = Boolean(result.hasMore && result.success && result.regeneratedCount);
      }
      if (warnings) setMessage((current) => `${current} ${warnings} archivos anteriores requieren limpieza posterior.`);
      router.refresh();
    } catch {
      setMessage(`${total} certificados corregidos. El proceso se interrumpió; puedes reintentar los pendientes.`);
    } finally {
      setPending(false);
      setConfirmed(false);
    }
  }

  return (
    <section aria-label="Corregir horas de certificados emitidos" className="space-y-3 rounded-2xl border border-cci-100 p-5">
      <h2 className="font-bold text-cci-950">Corregir horas de certificados emitidos</h2>
      <p className="text-sm text-slate-600">{validHours ? `Regenera los certificados vigentes con horas distintas de ${academicHours}. Conserva códigos, enlaces, nombres y fecha de emisión. No envía nuevos correos.` : "Primero guarda horas académicas mayores que cero en la actividad."}</p>
      {confirmed ? <div className="flex flex-wrap gap-3">
        <Button disabled={pending} onClick={regenerate} type="button">{pending ? "Regenerando… Mantén esta página abierta" : `Confirmar regeneración con ${academicHours} horas`}</Button>
        <Button disabled={pending} onClick={() => setConfirmed(false)} type="button" variant="secondary">Cancelar</Button>
      </div> : <Button disabled={!validHours} onClick={() => setConfirmed(true)} type="button" variant="secondary">Regenerar por horas académicas</Button>}
      <p aria-live="polite" className="text-sm text-slate-700" role="status">{message}</p>
    </section>
  );
}
