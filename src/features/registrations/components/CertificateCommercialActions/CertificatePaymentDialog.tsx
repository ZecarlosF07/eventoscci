"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/atoms/Button";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import type { CertificatePaymentDialogProps } from "@/features/registrations/components/CertificateCommercialActions/types/certificate-commercial-actions.types";
import {
  revertCertificatePaymentAction,
  verifyCertificatePaymentAction,
} from "@/features/registrations/mutations/registration-admin.actions";
import { formatRegistrationPrice } from "@/features/registrations/utils/registration-formatters";

export function CertificatePaymentDialog({
  activityId,
  certificatePrice,
  mode,
  onClose,
  participantName,
  registrationId,
  returnTo,
}: CertificatePaymentDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const isVerify = mode === "verify";
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  const action = isVerify
    ? verifyCertificatePaymentAction.bind(null, registrationId, activityId, returnTo)
    : revertCertificatePaymentAction.bind(null, registrationId, activityId, returnTo);
  const title = isVerify ? "Confirmar pago del certificado" : "Revertir pago del certificado";

  return createPortal(
    <div
      aria-labelledby="certificate-payment-title"
      aria-modal="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-cci-950/70 p-4"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
      role="dialog"
    >
      <form action={action} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-600">Control comercial</p>
            <h2 className="mt-1 text-2xl font-bold text-cci-950" id="certificate-payment-title">{title}</h2>
          </div>
          <button aria-label="Cerrar" className="grid size-11 place-items-center rounded-full border border-cci-200 text-xl" onClick={onClose} ref={closeRef} type="button">×</button>
        </div>
        <dl className="mt-5 grid gap-3 rounded-2xl bg-cci-50 p-4 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Participante</dt><dd className="font-semibold text-cci-950">{participantName}</dd></div>
          <div><dt className="text-slate-500">Tarifa</dt><dd className="font-semibold text-cci-950">{formatRegistrationPrice(certificatePrice)}</dd></div>
        </dl>
        {isVerify ? (
          <p className="mt-4 text-sm leading-6 text-slate-700">Confirma solo después de validar el comprobante fuera de la plataforma. Se registrarán tu usuario y la fecha.</p>
        ) : (
          <label className="mt-4 block text-sm font-semibold text-cci-950">
            Motivo de la reversión
            <textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 p-3 text-sm font-normal outline-none focus:border-cci-600 focus:ring-2 focus:ring-cci-100" maxLength={500} minLength={3} name="reversal_reason" placeholder="Explica brevemente por qué se revierte" required />
          </label>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose} type="button" variant="secondary">Volver</Button>
          <SubmitButton pendingLabel={isVerify ? "Confirmando…" : "Revirtiendo…"} variant={isVerify ? "primary" : "subtle"}>{isVerify ? "Confirmar pago" : "Revertir pago"}</SubmitButton>
        </div>
      </form>
    </div>,
    document.body,
  );
}
