"use client";

import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/atoms/Button";
import { ActivityArchiveDialog } from "@/features/activities/components/ActivityArchiveAction/ActivityArchiveDialog";
import type { ActivityArchiveActionProps } from "@/features/activities/components/ActivityArchiveAction/types/activity-archive-action.types";

export function ActivityArchiveAction(props: ActivityArchiveActionProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);
  const restoring = props.status === "archived";

  return (
    <>
      <Button onClick={() => setOpen(true)} ref={triggerRef} variant="secondary">
        {restoring ? "Restaurar" : "Archivar"}
      </Button>
      {open ? <ActivityArchiveDialog {...props} onClose={close} /> : null}
    </>
  );
}
