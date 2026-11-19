"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/Button";
import { CertificateHoursProgressBar } from "@/features/certificates/components/CertificateHoursRegeneration/CertificateHoursProgressBar";
import { regenerateActivityCertificateHoursAction } from "@/features/certificates/mutations/certificate.actions";
import { certificateHoursProgress } from "@/features/certificates/utils/certificate-hours-progress";
import { certificateHoursResultMessage } from "@/features/certificates/utils/certificate-hours-result";
import type { CertificateHoursProgress, CertificateHoursRegenerationProps } from "@/features/certificates/types/certificate-hours.types";

export function CertificateHoursRegeneration({ academicHours, activityId, activityTitle, outdatedCount }: CertificateHoursRegenerationProps) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [runProgress, setRunProgress] = useState<CertificateHoursProgress | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const progress = runProgress ?? certificateHoursProgress(0, outdatedCount);
  useEffect(() => {
    if (!pending) return;
    const timer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [pending]);
  const validHours = academicHours !== null && academicHours > 0;

  async function regenerate() {
    if (!validHours || academicHours === null) return;
    setPending(true);
    setMessage("");
    setElapsedSeconds(0);
    setRunProgress(certificateHoursProgress(0, outdatedCount));
    let completed = 0;
    let total = outdatedCount;
    let warnings = 0;
    try {
      let hasMore = true;
      while (hasMore) {
        const result = await regenerateActivityCertificateHoursAction(activityId, academicHours, activityTitle);
        if (result.totalCount !== undefined) total = completed + result.totalCount;
        completed += result.regeneratedCount ?? 0;
        if (result.remainingCount !== undefined) total = completed + result.remainingCount;
        setRunProgress(certificateHoursProgress(completed, total));
        warnings += result.cleanupWarningCount ?? 0;
        setMessage(certificateHoursResultMessage(completed, result.remainingCount, result.success ? undefined : result.message));
        hasMore = Boolean(result.hasMore && result.success && result.regeneratedCount);
      }
      if (warnings) setMessage((current) => `${current} ${warnings} archivos anteriores requieren limpieza posterior.`);
    } catch {
      setMessage(certificateHoursResultMessage(completed, undefined, "La conexión se interrumpió. Un lote puede haberse guardado aunque su respuesta no haya llegado."));
    } finally {
      setPending(false);
      setConfirmed(false);
      router.refresh();
    }
  }

  return (
    <section aria-label="Corregir título y horas de certificados emitidos" className="space-y-3 rounded-2xl border border-cci-100 p-5">
      <h2 className="font-bold text-cci-950">Corregir título y horas de certificados emitidos</h2>
      <p className="text-sm text-slate-600">{validHours ? `Actualiza los certificados vigentes cuyo título u horas difieran de la actividad. Se usarán ${academicHours} horas y el siguiente título.` : "Primero guarda horas académicas mayores que cero en la actividad."}</p>
      {validHours ? <p className="text-sm font-semibold text-cci-950">{activityTitle}</p> : null}
      {confirmed ? <div className="flex flex-wrap gap-3">
        <Button disabled={pending} onClick={regenerate} type="button">{pending ? "Regenerando… Mantén esta página abierta" : `Confirmar título y ${academicHours} horas`}</Button>
        <Button disabled={pending} onClick={() => setConfirmed(false)} type="button" variant="secondary">Cancelar</Button>
      </div> : <Button disabled={!validHours || !outdatedCount} onClick={() => setConfirmed(true)} type="button" variant="secondary">Regenerar título y horas</Button>}
      {validHours ? <p className="text-sm text-slate-600">{pending ? Math.max(0, progress.total - progress.completed) : outdatedCount} certificados pendientes de corrección.{runProgress ? " La barra muestra el avance de esta ejecución." : ""}</p> : null}
      <CertificateHoursProgressBar {...progress} />
      {pending ? <p className="flex items-center gap-2 text-sm text-slate-600"><span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-cci-200 border-t-cci-700 motion-reduce:animate-none" />Actualizando certificados · {elapsedSeconds} s transcurridos</p> : null}
      <p aria-live="polite" className="text-sm text-slate-700" role="status">{pending ? "Regeneración en curso. Mantén esta página abierta." : message || (validHours && !outdatedCount ? "No hay certificados pendientes de corrección." : "")}</p>
    </section>
  );
}
