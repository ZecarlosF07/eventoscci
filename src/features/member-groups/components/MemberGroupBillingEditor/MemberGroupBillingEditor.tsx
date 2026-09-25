"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { MemberBillingFields } from "@/features/member-groups/components/MemberBillingFields/MemberBillingFields";
import { correctMemberGroupBillingAction } from "@/features/member-groups/mutations/member-group-admin.actions";
import type { MemberBillingInput, MemberGroupAdminDetail } from "@/features/member-groups/types/member-group.types";

export function MemberGroupBillingEditor({ detail }: { detail: MemberGroupAdminDetail }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [billing, setBilling] = useState<MemberBillingInput>({
    type: detail.request.billingType === "boleta" ? "boleta" : "factura",
    document: detail.request.billingDocument ?? "",
    name: detail.request.billingName ?? "",
    address: detail.request.billingAddress ?? "",
  });
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  if (!detail.request.billingType) return null;
  function submit() {
    startTransition(async () => {
      const result = await correctMemberGroupBillingAction(detail.request.id, billing, reason);
      setMessage(result.message);
      if (result.success) { setOpen(false); setReason(""); router.refresh(); }
    });
  }
  return <div className="mt-4">
    <button className="min-h-11 text-sm font-bold text-cci-700 underline underline-offset-4" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>{open ? "Cerrar corrección" : "Corregir datos de comprobante"}</button>
    {open ? <div className="mt-3 space-y-5 rounded-xl border border-cci-200 p-4"><MemberBillingFields billing={billing} companyName={detail.request.companyName} companyRuc={detail.request.companyRuc} onChange={setBilling} /><label className="block text-sm font-semibold">Motivo de corrección<input className="mt-1 min-h-11 w-full rounded-xl border border-cci-200 px-3" maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} /></label><button className="min-h-11 rounded-xl bg-cci-950 px-5 font-bold text-white disabled:opacity-50" type="button" disabled={pending} onClick={submit}>{pending ? "Guardando…" : "Guardar corrección"}</button></div> : null}
    {message ? <p className="mt-3 text-sm font-medium" role="status">{message}</p> : null}
  </div>;
}
