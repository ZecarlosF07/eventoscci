"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { Badge } from "@/components/atoms/Badge";
import type { SpeakerProfileEditorProps } from "@/features/certificates/types/speaker-profile.types";
import { hasValidSpeakerCertificateEmail } from "@/features/certificates/utils/speaker-certificate-eligibility";

const SpeakerProfileDialog = dynamic(() => import("./SpeakerProfileDialog").then((module) => module.SpeakerProfileDialog), {
  loading: () => <p className="text-xs text-slate-600" role="status">Abriendo editor…</p>,
  ssr: false,
});

export function SpeakerProfileEditor({ activityId, candidate, disabled }: SpeakerProfileEditorProps) {
  const [open, setOpen] = useState(false);
  const emailReady = hasValidSpeakerCertificateEmail(candidate.email);
  const incomplete = !candidate.documentContext.documentNumber || !emailReady;
  return <div className="space-y-2">
    <p className="text-xs text-slate-600">{candidate.documentContext.documentNumber ? `DNI: ${candidate.documentContext.documentNumber}` : "DNI pendiente · necesario para emitir"}</p>
    {emailReady ? <><Badge variant="success">Envío por correo</Badge><p className="break-all text-xs text-slate-600">{candidate.email}</p></> : <p className="text-xs text-amber-800">Correo pendiente · necesario para emitir</p>}
    {!disabled ? <button className="inline-flex min-h-11 items-center text-sm font-semibold text-cci-800 underline underline-offset-4 hover:text-cci-950 focus-visible:outline-2 focus-visible:outline-offset-2" onClick={() => setOpen(true)} type="button">{incomplete ? "Completar datos" : "Editar datos"}</button> : null}
    {open ? <SpeakerProfileDialog activityId={activityId} onClose={() => setOpen(false)} speakerId={candidate.speakerId} /> : null}
  </div>;
}
