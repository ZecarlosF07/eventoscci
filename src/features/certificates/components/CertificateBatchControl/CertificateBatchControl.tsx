"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";

import { Button } from "@/components/atoms/Button";
import type { CertificateBatchControlProps } from "@/features/certificates/components/CertificateBatchControl/types/certificate-batch-control.types";
import { CERTIFICATE_AUTO_ISSUE_BATCH_SIZE } from "@/features/certificates/constants/certificate.constants";
import { processNextCertificateBatchAction, startCertificateBatchAction } from "@/features/certificates/mutations/certificate-batch.actions";
import type { CertificateBatchStatus } from "@/features/certificates/types/certificate-batch.types";
import { describeCertificateBatchError } from "@/features/certificates/utils/certificate-batch-errors";

function isUnfinished(batch: CertificateBatchStatus | null): batch is CertificateBatchStatus {
  return Boolean(batch && batch.pending + batch.processing + batch.recoverable > 0);
}

export function CertificateBatchControl({ activityId, initialBatch, readyCount, recoverableCount, templatesAvailable }: CertificateBatchControlProps) {
  const router = useRouter();
  const [batch, setBatch] = useState(initialBatch);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [lastCode, setLastCode] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  const canStart = readyCount + recoverableCount > 0;
  const active = isUnfinished(batch);

  async function run(current: CertificateBatchStatus) {
    let progress = current;
    for (let index = 0; index < CERTIFICATE_AUTO_ISSUE_BATCH_SIZE; index += 1) {
      if (!progress.pending && !progress.recoverable && !progress.processing) break;
      const result = await processNextCertificateBatchAction(activityId, progress.id);
      if (result.batch) { progress = result.batch; setBatch(progress); }
      if (result.processedCode) setLastCode(result.processedCode);
      if (result.message) setMessage(result.message);
      if (result.stop) break;
    }
    if (!progress.pending && !progress.recoverable && !progress.processing) {
      setMessage(progress.blocked
        ? `Tanda finalizada: ${progress.issued} emitidos y ${progress.blocked} sin emitir por cambios en sus requisitos.`
        : `Tanda completada: ${progress.issued} certificados emitidos.`);
    }
  }

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    if (!form || (!active && !form.reportValidity())) return;
    const count = active ? batch.total - batch.issued - batch.blocked : Math.min(CERTIFICATE_AUTO_ISSUE_BATCH_SIZE, readyCount + recoverableCount);
    if (!window.confirm(`${active ? "Se reanudará" : "Se iniciará"} una tanda de hasta ${count} certificados. Cada emisión puede avisar al participante por correo. ¿Continuar?`)) return;
    setRunning(true);
    setElapsedSeconds(0);
    setMessage("");
    try {
      let current = batch;
      if (!active) {
        const values = new FormData(form);
        const started = await startCertificateBatchAction(activityId, String(values.get("template_id") ?? ""), String(values.get("condition") ?? ""));
        if (started.message || !started.batch) { setMessage(started.message ?? "No se pudo iniciar la tanda."); return; }
        current = started.batch;
        setBatch(current);
      }
      if (current) await run(current);
    } catch {
      setMessage("La conexión se interrumpió. El avance quedó guardado; actualiza la página antes de reanudar.");
    } finally {
      setRunning(false);
      router.refresh();
    }
  }

  const progress = batch ? Math.round((batch.issued + batch.blocked) * 100 / Math.max(1, batch.total)) : 0;
  return <section aria-label="Emisión rápida de certificados" className="space-y-3 rounded-2xl border border-cci-200 bg-cci-50 p-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="font-semibold">Emisión rápida</p>
        <p className="text-sm text-slate-600">{batch && active
          ? `Tanda guardada: ${batch.issued} de ${batch.total} emitidos · ${batch.pending} pendientes · ${batch.recoverable} por reintentar · ${batch.blocked} bloqueados.`
          : `${readyCount} personas listas${recoverableCount ? ` y ${recoverableCount} certificados incompletos por recuperar` : ""}. Hasta 20 por tanda.`}</p>
      </div>
      <Button disabled={running || (!active && (!templatesAvailable || !canStart))} onClick={handleClick} type="button">
        {running ? `Emitiendo ${Math.min((batch?.issued ?? 0) + (batch?.blocked ?? 0) + 1, batch?.total ?? 20)} de ${batch?.total ?? 20}…` : active ? "Reanudar pendientes" : `Emitir próximos ${Math.min(CERTIFICATE_AUTO_ISSUE_BATCH_SIZE, readyCount + recoverableCount)} listos`}
      </Button>
    </div>
    {batch ? <div aria-label={`${batch.issued + batch.blocked} de ${batch.total} procesados`} className="h-2 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuenow={batch.issued + batch.blocked} aria-valuemin={0} aria-valuemax={batch.total}><div className="h-full rounded-full bg-cci-700 transition-[width]" style={{ width: `${progress}%` }} /></div> : null}
    <p aria-live="polite" className="text-sm text-slate-700">{running ? `Generando el siguiente PDF · ${batch?.issued ?? 0} emitidos · ${elapsedSeconds} s transcurridos.${lastCode ? ` Último: ${lastCode}.` : ""} Puedes volver y reanudar si cierras esta ventana.` : message || (lastCode ? `Último procesado: ${lastCode}.` : "")}</p>
    {batch?.errors.length ? <details className="text-sm text-amber-900"><summary className="cursor-pointer font-semibold">Revisar {batch.errors.length} casos con incidencias</summary><ul className="mt-2 space-y-1">{batch.errors.map((item) => <li key={item.registration_id}>{item.registration_code ?? item.registration_id}: {describeCertificateBatchError(item.reason)}</li>)}</ul></details> : null}
    {batch?.email_attention ? <p className="text-sm text-amber-900">{batch.email_attention} avisos por correo requieren revisión en Notificaciones; no se reenviarán automáticamente.</p> : null}
  </section>;
}
