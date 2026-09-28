"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { verifyIndividualPaymentAction } from "@/features/participation/mutations/individual-payment.actions";
import type { IndividualPaymentFormProps } from "@/features/participation/types/payment.types";

export function IndividualPaymentForm({ registrationId, price }: IndividualPaymentFormProps) {
  const router = useRouter();
  const key = useRef(crypto.randomUUID());
  const amountRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  return <form className="space-y-4 rounded-2xl bg-cci-50 p-5" onSubmit={(event) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const amount = Number(values.get("amount"));
    if (!Number.isFinite(amount) || Math.round(amount * 100) !== Math.round(price * 100)) {
      setMessage("El importe debe ser igual al precio histórico. No se admiten abonos parciales de una plaza.");
      amountRef.current?.focus();
      return;
    }
    if (!window.confirm(`¿Registrar S/ ${price.toFixed(2)} y confirmar esta inscripción?`)) return;
    startTransition(async () => {
      try {
        const result = await verifyIndividualPaymentAction({ registrationId, receivedAmount: amount,
          reference: String(values.get("reference") ?? ""), note: String(values.get("note") ?? ""), idempotencyKey: key.current });
        setMessage(result.message);
        if (result.success) router.refresh();
      } catch { setMessage("La conexión se interrumpió. Reintenta con los mismos datos; el pago no se duplicará."); }
    });
  }}>
    <h3 className="text-lg font-bold text-cci-950">Validar pago de participación</h3>
    <p className="text-sm text-slate-600">Precio histórico: <strong>S/ {price.toFixed(2)}</strong>. Confirma solo después de revisar el pago recibido.</p>
    <fieldset className="space-y-4" disabled={pending}>
      <label className="block font-semibold">Importe recibido (S/)<input className="mt-1 min-h-11 w-full rounded-xl border border-cci-200 bg-white px-3" inputMode="decimal" min="0.01" name="amount" ref={amountRef} required step="0.01" type="number" /></label>
      <label className="block font-semibold">Medio o referencia del pago<input className="mt-1 min-h-11 w-full rounded-xl border border-cci-200 bg-white px-3" maxLength={150} minLength={2} name="reference" required /></label>
      <label className="block font-semibold">Nota (opcional)<textarea className="mt-1 min-h-20 w-full rounded-xl border border-cci-200 bg-white p-3" maxLength={500} name="note" /></label>
      <button className="min-h-11 rounded-xl bg-cci-950 px-5 font-bold text-white disabled:opacity-50" disabled={pending} type="submit">{pending ? "Validando…" : "Registrar pago y confirmar"}</button>
    </fieldset>
    {message ? <p role="status">{message}</p> : null}
  </form>;
}
