"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/atoms/Button";
import { Heading } from "@/components/atoms/Heading";
import type { CertificateRegenerationDialogProps } from "@/features/certificates/components/CertificateRegenerationDialog/types/certificate-regeneration-dialog.types";

export function CertificateRegenerationDialog({
  certificates,
  onClose,
  onSubmit,
  participantName,
  pending,
}: CertificateRegenerationDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, pending]);

  return (
    <div
      aria-labelledby="certificate-regeneration-title"
      aria-modal="true"
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-cci-950/70 p-4"
      onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) onClose(); }}
      role="dialog"
    >
      <form className="my-auto w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl" method="post" onSubmit={onSubmit}>
        <input name="confirmed" type="hidden" value="yes" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-600">Confirmar reemplazo</p>
            <Heading className="mt-1" id="certificate-regeneration-title" level={3}>Regenerar {certificates.length} certificados</Heading>
          </div>
          <button aria-label="Cerrar" className="grid size-11 place-items-center rounded-full border border-cci-200 text-xl" disabled={pending} onClick={onClose} ref={closeRef} type="button">×</button>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-700">Los nuevos documentos mostrarán <strong>{participantName}</strong>. Se conservarán sus códigos y enlaces públicos.</p>
        <ul className="mt-5 max-h-64 space-y-2 overflow-y-auto rounded-2xl bg-cci-50 p-4">
          {certificates.map((certificate) => (
            <li className="flex flex-col gap-1 border-b border-cci-100 pb-2 last:border-0 last:pb-0 sm:flex-row sm:justify-between" key={certificate.id}>
              <span className="font-medium text-cci-950">{certificate.title_snapshot}</span>
              <span className="font-mono text-xs text-slate-600">{certificate.certificate_code}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button disabled={pending} onClick={onClose} type="button" variant="secondary">Cancelar</Button>
          <Button disabled={pending} type="submit">{pending ? "Regenerando…" : "Confirmar regeneración"}</Button>
        </div>
      </form>
    </div>
  );
}
