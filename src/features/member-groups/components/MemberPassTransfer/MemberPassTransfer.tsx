"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { transferMemberPassAction } from "@/features/member-groups/mutations/member-group-admin.actions";

interface MemberPassTransferProps {
  candidates: { id: string; label: string }[];
  passId: string;
  requestId: string;
}

export function MemberPassTransfer({ candidates, passId, requestId }: MemberPassTransferProps) {
  const router = useRouter();
  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  if (!candidates.length) return <p className="mt-3 text-sm text-slate-600">No hay una plaza pendiente del mismo RUC a la que transferir este pase.</p>;
  function submit() {
    if (!window.confirm("¿Transferir este pase gratuito a la persona seleccionada? Su plaza quedará confirmada sin pago.")) return;
    startTransition(async () => {
      const result = await transferMemberPassAction(requestId, passId, targetId, reason);
      setMessage(result.message);
      if (result.success) router.refresh();
    });
  }
  return <div className="mt-4 space-y-3 rounded-xl border border-cci-200 bg-cci-50 p-4">
    <p className="font-semibold text-cci-950">Transferir pase gratuito</p>
    <label className="block text-sm font-medium">Asistente pendiente del mismo RUC
      <select className="mt-1 min-h-11 w-full rounded-xl border border-cci-200 bg-white px-3" value={targetId} onChange={(event) => setTargetId(event.target.value)}><option value="">Selecciona a la persona</option>{candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.label}</option>)}</select>
    </label>
    <label className="block text-sm font-medium">Motivo de la transferencia
      <input className="mt-1 min-h-11 w-full rounded-xl border border-cci-200 bg-white px-3" maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} />
    </label>
    <button className="min-h-11 rounded-xl bg-cci-950 px-4 font-bold text-white disabled:opacity-50" disabled={pending || !targetId || reason.trim().length < 2} onClick={submit} type="button">{pending ? "Transfiriendo…" : "Transferir pase"}</button>
    {message ? <p className="text-sm" role="status">{message}</p> : null}
  </div>;
}
