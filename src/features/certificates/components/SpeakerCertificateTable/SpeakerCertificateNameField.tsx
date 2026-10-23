"use client";

import { useState } from "react";

import { Input } from "@/components/atoms/Input";
import { CERTIFICATE_FULL_NAME_MAX_LENGTH } from "@/features/certificates/constants/certificate.constants";
import type { SpeakerCertificateNameFieldProps } from "@/features/certificates/types/speaker-certificate.types";

export function SpeakerCertificateNameField({ disabled, editable, onChange, speakerId, value }: SpeakerCertificateNameFieldProps) {
  const [editing, setEditing] = useState(false);
  const inputId = `certificate-name-${speakerId}`;
  return <div className="min-w-0 flex-1">
    {editing && editable ? <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-600" htmlFor={inputId}>Nombre completo en el certificado</label>
      <Input aria-describedby={`${inputId}-hint`} disabled={disabled} id={inputId} maxLength={CERTIFICATE_FULL_NAME_MAX_LENGTH} minLength={2} onChange={(event) => onChange(event.target.value)} value={value} />
      <p className="text-xs text-slate-500" id={`${inputId}-hint`}>Se guardará al emitir. No modifica Catálogos.</p>
      <button className="inline-flex min-h-11 items-center text-xs font-semibold text-cci-800 underline" disabled={disabled || value.trim().length < 2} onClick={() => setEditing(false)} type="button">Listo</button>
    </div> : <>
      <p className="break-words font-semibold text-cci-950">{value}</p>
      {editable ? <button aria-controls={inputId} aria-expanded={editing} className="inline-flex min-h-11 items-center text-xs font-semibold text-cci-800 underline" disabled={disabled} onClick={() => setEditing(true)} type="button">Editar nombre</button> : null}
    </>}
  </div>;
}
