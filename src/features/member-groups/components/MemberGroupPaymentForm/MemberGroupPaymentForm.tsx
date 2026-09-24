"use client";

import { useRef, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { verifyMemberGroupPaymentAction } from "@/features/member-groups/mutations/member-group-admin.actions";
import type { MemberGroupAdminDetail } from "@/features/member-groups/types/member-group.types";

export function MemberGroupPaymentForm({ detail }: { detail: MemberGroupAdminDetail }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [reference, setReference] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const key = useRef(crypto.randomUUID());
  const seats = detail.attendees.filter((attendee) => attendee.status === "pending");
  const amount = seats.filter((seat) => selected.includes(seat.id)).reduce((sum, seat) => sum + seat.price, 0);

  function toggle(id: string) { setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  function submit() {
    if (!selected.length || reference.trim().length < 2 || !receivedAmount) { setMessage("Selecciona plazas y completa el importe recibido y la referencia del pago."); return; }
    if (Math.round(Number(receivedAmount) * 100) !== Math.round(amount * 100)) { setMessage("El importe recibido debe coincidir exactamente con las plazas seleccionadas."); return; }
    if (!window.confirm(`¿Validar S/ ${amount.toFixed(2)} para ${selected.length} ${selected.length === 1 ? "plaza" : "plazas"}?`)) return;
    startTransition(async () => {
      try {
        const result = await verifyMemberGroupPaymentAction({ requestId: detail.request.id, registrationIds: selected, reference, receivedAmount: Number(receivedAmount), note, idempotencyKey: key.current });
        setMessage(result.message);
        if (result.success) { setSelected([]); setReference(""); setReceivedAmount(""); setNote(""); key.current = crypto.randomUUID(); router.refresh(); }
      } catch { setMessage("Se interrumpió la conexión. Vuelve a intentar; el mismo pago no se duplicará."); }
    });
  }

  return <section className="space-y-5 rounded-2xl border border-cci-200 bg-cci-50 p-5">
    <div><h2 className="text-xl font-bold text-cci-950">Validar pago manual</h2><p className="mt-1 text-sm text-slate-600">Marca solo las personas cubiertas por este pago. Se confirmarán únicamente esas plazas.</p></div>
    <fieldset className="space-y-2"><legend className="font-semibold">Plazas pendientes</legend>{seats.map((seat) => <label key={seat.id} className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border border-cci-200 bg-white p-3"><span className="flex items-center gap-3"><input type="checkbox" checked={selected.includes(seat.id)} onChange={() => toggle(seat.id)} />{seat.firstNames} {seat.lastNames}</span><strong>S/ {seat.price.toFixed(2)}</strong></label>)}</fieldset>
    <p className="text-lg font-bold text-cci-950" aria-live="polite">Importe a validar: S/ {amount.toFixed(2)}</p>
    <label className="block text-sm font-semibold">Importe recibido (S/)<input className="mt-1 min-h-11 w-full rounded-xl border border-cci-200 bg-white px-3" type="number" inputMode="decimal" min="0.01" step="0.01" value={receivedAmount} onChange={(event) => setReceivedAmount(event.target.value)} /></label>
    <label className="block text-sm font-semibold">Medio o referencia del pago<input className="mt-1 min-h-11 w-full rounded-xl border border-cci-200 bg-white px-3" maxLength={150} value={reference} onChange={(event) => setReference(event.target.value)} /></label>
    <label className="block text-sm font-semibold">Nota (opcional)<textarea className="mt-1 min-h-20 w-full rounded-xl border border-cci-200 bg-white p-3" maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} /></label>
    <button className="min-h-11 rounded-xl bg-cci-950 px-5 font-bold text-white disabled:opacity-50" type="button" disabled={pending || !selected.length} onClick={submit}>{pending ? "Validando…" : `Confirmar ${selected.length} ${selected.length === 1 ? "plaza" : "plazas"}`}</button>
    {message ? <p className="text-sm font-medium" role="status">{message}</p> : null}
  </section>;
}
