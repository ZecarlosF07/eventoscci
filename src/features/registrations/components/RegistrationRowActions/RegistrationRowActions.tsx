"use client";

import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/atoms/Button";
import { RegistrationActionDialog } from "@/features/registrations/components/RegistrationRowActions/RegistrationActionDialog";
import type { RegistrationRowActionsProps } from "@/features/registrations/components/RegistrationRowActions/types/registration-row-actions.types";

export function RegistrationRowActions({ registration, returnTo }: RegistrationRowActionsProps) {
  const [mode, setMode] = useState<"cancel" | "confirm" | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const open = (nextMode: "cancel" | "confirm", trigger: HTMLButtonElement) => {
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
        {registration.status === "pending" ? <Button onClick={(event) => open("confirm", event.currentTarget)}>Verificar y confirmar</Button> : null}
        <Button onClick={(event) => open("cancel", event.currentTarget)} variant="secondary">Cancelar</Button>
      </div>
      {mode ? <RegistrationActionDialog mode={mode} onClose={close} registration={registration} returnTo={returnTo} /> : null}
    </>
  );
}
