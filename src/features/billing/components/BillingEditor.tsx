"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BillingFields } from "@/features/billing/components/BillingFields";
import { correctBilling } from "@/features/billing/mutations/correct-billing";
import { billingSchema } from "@/features/billing/schemas/billing.schema";
import type { BillingEditorProps, BillingInput } from "@/features/billing/types/billing.types";
import { focusFirstInvalidField } from "@/features/registrations/utils/focus-first-invalid-field";

export function BillingEditor({ item, onSaved }: BillingEditorProps) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [billing, setBilling] = useState<BillingInput>({ type: item.billing_type === "factura" ? "factura" : "boleta", document: item.billing_document ?? "", name: item.billing_name ?? "", address: item.billing_address ?? "" });
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  if (!item.billing_type || !item.id || (item.kind !== "individual" && item.kind !== "group")) return null;
  const id = item.id;
  const kind = item.kind;
  function submit() {
    const parsed = billingSchema.safeParse(billing);
    const nextErrors = parsed.success ? {} : Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]));
    if (reason.trim().length < 2) nextErrors.reason = "Indica el motivo de la corrección.";
    setErrors(nextErrors);
    if (!parsed.success || nextErrors.reason) { if (form.current) focusFirstInvalidField(form.current); return; }
    startTransition(async () => {
      try {
        const result = await correctBilling({ kind, id, billing: parsed.data, reason });
        setMessage(result.message);
        if (result.success) { setOpen(false); setReason(""); onSaved?.(result.message); router.refresh(); }
      } catch { setMessage("No se pudo guardar. Reintenta o actualiza para comprobar el resultado."); }
    });
  }
  return <div className="space-y-3"><button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="min-h-11 font-semibold text-cci-700 underline">{open ? "Cerrar corrección" : "Corregir datos existentes"}</button>
    {open ? <form ref={form} noValidate className="space-y-4 rounded-xl border border-cci-200 p-4" onSubmit={(event) => { event.preventDefault(); if (!pending) submit(); }}>
      <BillingFields billing={billing} onChange={setBilling} errors={errors} />
      <label className="block text-sm font-semibold" htmlFor="billing-reason">Motivo de la corrección</label>
      <textarea id="billing-reason" required aria-invalid={Boolean(errors.reason)} aria-describedby={errors.reason ? "billing-reason-error" : undefined} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} className="w-full rounded-xl border border-slate-300 p-3" />
      {errors.reason ? <p id="billing-reason-error" role="alert" className="text-sm text-red-700">{errors.reason}</p> : null}
      <button disabled={pending} type="submit" className="min-h-11 rounded-xl bg-cci-950 px-4 font-semibold text-white disabled:opacity-50">{pending ? "Guardando…" : "Guardar corrección auditada"}</button>
    </form> : null}<p role="status" aria-live="polite" className="text-sm">{message}</p>
  </div>;
}
