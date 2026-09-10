"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/atoms/Button";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import type { ActivityArchiveDialogProps } from "@/features/activities/components/ActivityArchiveAction/types/activity-archive-action.types";
import { changeActivityStatusAction } from "@/features/activities/mutations/activity.actions";

export function ActivityArchiveDialog({
  activityId,
  activityTitle,
  activityType,
  onClose,
  status,
}: ActivityArchiveDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoring = status === "archived";
  const nextStatus = restoring ? "draft" : "archived";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return createPortal(
    <div
      aria-labelledby="activity-archive-title"
      aria-modal="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-cci-950/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      <form
        action={changeActivityStatusAction.bind(null, activityId, activityType, nextStatus)}
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-600">Gestión de actividad</p>
            <h2 className="mt-1 text-2xl font-bold text-cci-950" id="activity-archive-title">
              {restoring ? "Restaurar como borrador" : "Archivar actividad"}
            </h2>
          </div>
          <button aria-label="Cerrar" className="grid size-11 place-items-center rounded-full border border-cci-200 text-xl" onClick={onClose} ref={closeRef} type="button">×</button>
        </div>
        <p className="mt-5 font-semibold text-cci-950">{activityTitle}</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {restoring
            ? "La actividad volverá como borrador. Revisa sus datos antes de publicarla nuevamente."
            : "Dejará de aparecer en el portal, Participación, pagos y Certificados. Sus datos se conservarán para una futura restauración."}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose} type="button" variant="secondary">Volver</Button>
          <SubmitButton pendingLabel={restoring ? "Restaurando…" : "Archivando…"} variant={restoring ? "primary" : "subtle"}>
            {restoring ? "Restaurar como borrador" : "Sí, archivar"}
          </SubmitButton>
        </div>
      </form>
    </div>,
    document.body,
  );
}
