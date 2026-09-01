"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/atoms/Button";
import { Heading } from "@/components/atoms/Heading";
import { QuickCatalogFields } from "@/features/catalogs/components/CatalogQuickCreateDialog/QuickCatalogFields";
import type { CatalogQuickCreateDialogProps } from "@/features/catalogs/components/CatalogQuickCreateDialog/types/catalog-quick-create-dialog.types";
import { CATALOG_TITLES } from "@/features/catalogs/constants/catalog.constants";
import { quickCreateCatalogAction } from "@/features/catalogs/mutations/catalog.actions";
import type { QuickCatalogResult } from "@/features/catalogs/types/catalog.types";

function collectFields(container: HTMLDivElement, kind: string): FormData {
  const data = new FormData();
  data.set("kind", kind);
  data.set("quick", "1");
  container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[name]").forEach((field) => {
    if (field instanceof HTMLInputElement && field.type === "file") {
      if (field.files?.[0]) data.set(field.name, field.files[0]);
      return;
    }
    if (field instanceof HTMLInputElement && field.type === "checkbox") {
      if (field.checked) data.set(field.name, "on");
      return;
    }
    data.set(field.name, field.value);
  });
  return data;
}

export function CatalogQuickCreateDialog({ kind, onCreated }: CatalogQuickCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<QuickCatalogResult>({});
  const [pending, startTransition] = useTransition();
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    contentRef.current?.querySelector<HTMLElement>("input, textarea")?.focus();
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

  function save() {
    if (!contentRef.current) return;
    const data = collectFields(contentRef.current, kind);
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
      {open ? (
        <div aria-labelledby={`quick-${kind}-title`} aria-modal="true" className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-cci-950/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }} role="dialog">
          <div className="my-auto w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-600">Creación rápida</p><Heading className="mt-1" id={`quick-${kind}-title`} level={3}>Nuevo registro en {CATALOG_TITLES[kind]}</Heading></div>
              <button aria-label="Cerrar" className="grid size-11 place-items-center rounded-full border border-cci-200 text-xl" onClick={() => setOpen(false)} type="button">×</button>
            </div>
            <div className="mt-6" ref={contentRef}><QuickCatalogFields errors={state.errors} kind={kind} /></div>
            {state.message ? <p aria-live="polite" className="mt-4 text-sm font-medium text-rose-700">{state.message}</p> : null}
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setOpen(false)} type="button" variant="secondary">Cancelar</Button>
              <Button disabled={pending} onClick={save} type="button">{pending ? "Guardando…" : "Crear y seleccionar"}</Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
