"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/atoms/Button";
import { Heading } from "@/components/atoms/Heading";
import { QuickCatalogFields } from "@/features/catalogs/components/CatalogQuickCreateDialog/QuickCatalogFields";
import type { CatalogQuickCreateDialogProps } from "@/features/catalogs/components/CatalogQuickCreateDialog/types/catalog-quick-create-dialog.types";
import { CATALOG_TITLES } from "@/features/catalogs/constants/catalog.constants";
import { quickCreateCatalogAction } from "@/features/catalogs/mutations/catalog.actions";
import type { QuickCatalogResult } from "@/features/catalogs/types/catalog.types";

function collectFields(form: HTMLFormElement, kind: string): FormData {
  const data = new FormData(form);
  data.set("kind", kind);
  data.set("quick", "1");
  return data;
}

export function CatalogQuickCreateDialog({ kind, onCreated }: CatalogQuickCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<QuickCatalogResult>({});
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    formRef.current?.querySelector<HTMLElement>("input, textarea")?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      trigger?.focus();
    };
  }, [open]);

  function save(form: HTMLFormElement) {
    const data = collectFields(form, kind);
    startTransition(async () => {
      const result = await quickCreateCatalogAction(data);
      setState(result);
      if (!result.option) return;
      onCreated(result.option);
      setOpen(false);
      setState({});
    });
  }

  return (
    <>
      <button className="text-sm font-semibold text-cci-800 underline decoration-cci-lime decoration-2 underline-offset-4" onClick={() => setOpen(true)} ref={triggerRef} type="button">+ Crear nuevo</button>
      {open ? createPortal(
        <div aria-labelledby={`quick-${kind}-title`} aria-modal="true" className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-cci-950/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }} role="dialog">
          <form className="my-auto w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl sm:p-7" encType="multipart/form-data" onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); save(event.currentTarget); }} ref={formRef}>
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-600">Creación rápida</p><Heading className="mt-1" id={`quick-${kind}-title`} level={3}>Nuevo registro en {CATALOG_TITLES[kind]}</Heading></div>
              <button aria-label="Cerrar" className="grid size-11 place-items-center rounded-full border border-cci-200 text-xl" onClick={() => setOpen(false)} type="button">×</button>
            </div>
            <div className="mt-6"><QuickCatalogFields errors={state.errors} kind={kind} /></div>
            {state.message ? <p aria-live="polite" className="mt-4 text-sm font-medium text-rose-700">{state.message}</p> : null}
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setOpen(false)} type="button" variant="secondary">Cancelar</Button>
              <Button disabled={pending} type="submit">{pending ? "Guardando…" : "Crear y seleccionar"}</Button>
            </div>
          </form>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
