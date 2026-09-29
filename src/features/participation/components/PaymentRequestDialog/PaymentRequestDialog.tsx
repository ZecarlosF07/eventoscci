"use client";

import { useEffect, useRef } from "react";

import type { PaymentRequestDialogProps } from "@/features/participation/types/payment.types";
import { restorePaymentDialogFocus } from "@/features/participation/utils/payment-dialog-focus";

export function PaymentRequestDialog({ children, onClose, requestId, title = "Detalle del pago", dialogId = "payment-request-dialog", headingId = "payment-dialog-title" }: PaymentRequestDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      restorePaymentDialogFocus(previousFocus, requestId);
    };
  }, [requestId]);

  return (
    <dialog
      aria-labelledby={headingId}
      aria-modal="true"
      className="fixed inset-0 m-auto hidden max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-3xl flex-col overflow-hidden rounded-2xl border border-cci-200 bg-white p-0 text-cci-950 shadow-2xl backdrop:bg-cci-950/65 open:flex"
      id={dialogId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      ref={dialogRef}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-cci-100 px-4 py-3 sm:px-6">
        <h2 className="text-lg font-bold" id={headingId}>{title}</h2>
        <button className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-cci-200 px-3 text-sm font-semibold transition hover:bg-cci-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-700" onClick={onClose} ref={closeRef} type="button">
          Cerrar detalle ×
        </button>
      </header>
      <div className="min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">{children}</div>
    </dialog>
  );
}
