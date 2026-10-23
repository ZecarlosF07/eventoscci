"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { ROUTES } from "@/constants/routes";
import { revokeCertificateAction } from "@/features/certificates/mutations/certificate.actions";
import { regenerateSpeakerCertificateAction } from "@/features/certificates/mutations/speaker-certificate.actions";
import type { SpeakerCertificateActionsProps } from "@/features/certificates/types/speaker-certificate.types";

export function SpeakerCertificateActions({ activityId, candidate, readOnly }: SpeakerCertificateActionsProps) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const token = candidate.accessToken;
  if (!token || !candidate.certificateId) return null;
  const certificateId = candidate.certificateId;
  const linkClass = "inline-flex min-h-11 items-center font-semibold text-cci-800 underline disabled:opacity-50";
  function regenerate() {
    if (!window.confirm("Se regenerará el PDF con el nombre, rol, fechas y plantilla originales. ¿Continuar?")) return;
    startTransition(async () => {
      try { setMessage(await regenerateSpeakerCertificateAction(certificateId)); }
      catch { setMessage("No se pudo regenerar el PDF. Puedes reintentar."); }
    });
  }
  function revoke() {
    const reason = window.prompt("Motivo obligatorio de revocación (máximo 500 caracteres):");
    if (!reason?.trim()) return;
    startTransition(async () => {
      const form = new FormData();
      form.set("revocation_reason", reason);
      try {
        await revokeCertificateAction(certificateId, `${ROUTES.adminCertificatesSpeakers}/${activityId}`, form);
        setMessage("Certificado revocado.");
      } catch { setMessage("No se pudo revocar. Actualiza la página y revisa el estado."); }
    });
  }
  async function copy() {
    try { await navigator.clipboard.writeText(`${window.location.origin}/certificados/${token}`); setMessage("Enlace copiado."); }
    catch { setMessage("Abre «Ver» y copia el enlace desde el navegador."); }
  }
  return <div>
    <div className="flex flex-wrap gap-x-3">
      <Link className={linkClass} href={`/certificados/${token}`} target="_blank" rel="noreferrer">Ver</Link>
      {candidate.filePath && candidate.certificateStatus === "issued" ? <a className={linkClass} href={`/certificados/${token}/descargar`}>Descargar</a> : null}
      <button className={linkClass} onClick={copy} type="button">Copiar enlace</button>
      {!readOnly && candidate.filePath && candidate.certificateStatus === "issued" ? <button className={linkClass} disabled={pending} onClick={regenerate} type="button">Regenerar PDF</button> : null}
      {!readOnly && candidate.certificateStatus === "issued" ? <button className={linkClass} disabled={pending} onClick={revoke} type="button">Revocar</button> : null}
    </div>
    {message || pending ? <p role="status" className="text-xs text-slate-600">{pending ? "Procesando…" : message}</p> : null}
  </div>;
}
