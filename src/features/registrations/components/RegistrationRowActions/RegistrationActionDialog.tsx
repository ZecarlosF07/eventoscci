"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/atoms/Button";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { cancelRegistrationAction, confirmRegistrationAction } from "@/features/registrations/mutations/registration-admin.actions";
import type { RegistrationAdminItem } from "@/features/registrations/types/registration.types";
import { formatRegistrationPrice } from "@/features/registrations/utils/registration-formatters";

interface Props {
  mode: "cancel" | "confirm";
  onClose: () => void;
  registration: RegistrationAdminItem;
  returnTo: string;
}

export function RegistrationActionDialog({ mode, onClose, registration, returnTo }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", closeOnEscape); };
  }, [onClose]);

  const isConfirm = mode === "confirm";
  const action = isConfirm
    ? confirmRegistrationAction.bind(null, registration.id, returnTo)
    : cancelRegistrationAction.bind(null, registration.id, returnTo);

  return createPortal(
    <div aria-labelledby="registration-action-title" aria-modal="true" className="fixed inset-0 z-[100] grid place-items-center bg-cci-950/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} role="dialog">
      <form action={action} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-600">{isConfirm ? "Validación de pago" : "Cambio de estado"}</p>
            <h2 className="mt-1 text-2xl font-bold text-cci-950" id="registration-action-title">{isConfirm ? "Confirmar inscripción" : "Cancelar inscripción"}</h2>
          </div>
          <button aria-label="Cerrar" className="grid size-11 place-items-center rounded-full border border-cci-200 text-xl" onClick={onClose} ref={closeRef} type="button">×</button>
        </div>
        <dl className="mt-5 grid gap-3 rounded-2xl bg-cci-50 p-4 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Participante</dt><dd className="font-semibold text-cci-950">{registration.person.first_names} {registration.person.last_names}</dd></div>
          <div><dt className="text-slate-500">Importe</dt><dd className="font-semibold text-cci-950">{formatRegistrationPrice(registration.price_snapshot)}</dd></div>
          <div className="sm:col-span-2"><dt className="text-slate-500">Actividad</dt><dd className="font-semibold text-cci-950">{registration.activity.title}</dd></div>
        </dl>
        {isConfirm ? <p className="mt-4 text-sm leading-6 text-slate-700">Confirma únicamente cuando hayas verificado el pago. La operación quedará registrada en auditoría.</p> : <textarea className="mt-4 min-h-24 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-cci-600 focus:ring-2 focus:ring-cci-100" maxLength={500} name="cancellation_reason" placeholder="Motivo de cancelación (opcional)" />}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose} type="button" variant="secondary">Volver</Button>
          <SubmitButton pendingLabel={isConfirm ? "Confirmando…" : "Cancelando…"} variant={isConfirm ? "primary" : "subtle"}>{isConfirm ? "Sí, confirmar inscripción" : "Cancelar inscripción"}</SubmitButton>
        </div>
      </form>
    </div>,
    document.body,
  );
}
