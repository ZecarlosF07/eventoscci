"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { cancelMemberGroupSeatAction } from "@/features/member-groups/mutations/member-group-admin.actions";

export function MemberGroupSeatCancel({ requestId, registrationId }: { requestId: string; registrationId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  function cancel() {
    if (!window.confirm("¿Cancelar esta plaza? Se liberará el cupo y no podrá restaurarse desde este formulario.")) return;
    startTransition(async () => {
      const result = await cancelMemberGroupSeatAction(requestId, registrationId, reason);
      setMessage(result.message);
      if (result.success) router.refresh();
    });
  }
  return <div className="mt-3 flex flex-wrap items-center gap-2"><input className="min-h-11 min-w-48 flex-1 rounded-xl border border-cci-200 px-3 text-sm" aria-label="Motivo de cancelación" placeholder="Motivo de cancelación" maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} /><button className="min-h-11 rounded-xl border border-rose-200 px-4 text-sm font-bold text-rose-700 disabled:opacity-50" type="button" disabled={pending || reason.trim().length < 2} onClick={cancel}>Cancelar plaza</button>{message ? <p className="w-full text-sm" role="status">{message}</p> : null}</div>;
}
