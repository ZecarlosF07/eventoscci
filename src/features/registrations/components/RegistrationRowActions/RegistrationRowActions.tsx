"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/atoms/Button";
import { RegistrationActionDialog } from "@/features/registrations/components/RegistrationRowActions/RegistrationActionDialog";
import type { RegistrationRowActionsProps } from "@/features/registrations/components/RegistrationRowActions/types/registration-row-actions.types";
import { getActivityPaymentsRoute } from "@/features/participation/utils/participation-routes";

export function RegistrationRowActions({ registration, returnTo }: RegistrationRowActionsProps) {
  const [mode, setMode] = useState<"cancel" | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const open = (nextMode: "cancel", trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setMode(nextMode);
  };
  const close = useCallback(() => {
    setMode(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);
  if (registration.status === "cancelled") return <span className="text-xs text-slate-500">Sin acciones disponibles</span>;
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {registration.price_snapshot > 0 ? <Link className="inline-flex min-h-11 items-center rounded-xl border border-cci-200 px-4 text-sm font-semibold" href={getActivityPaymentsRoute(registration.activity.id, registration.member_group_request_id ?? registration.id)}>Ver pago →</Link> : null}
        {registration.member_group_request_id ? <Link className="inline-flex min-h-11 items-center text-sm font-semibold text-cci-700 underline" href={`/admin/inscripciones/solicitudes/${registration.member_group_request_id}`}>Ver solicitud grupal</Link> : <Button onClick={(event) => open("cancel", event.currentTarget)} variant="secondary">Cancelar</Button>}
      </div>
      {mode ? <RegistrationActionDialog onClose={close} registration={registration} returnTo={returnTo} /> : null}
    </>
  );
}
