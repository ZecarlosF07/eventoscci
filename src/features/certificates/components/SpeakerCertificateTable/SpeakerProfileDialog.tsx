"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/atoms/Button";
import { CatalogForm } from "@/features/catalogs/components/CatalogForm";
import { saveSpeakerProfileFromCertificatesAction } from "@/features/catalogs/mutations/catalog.actions";
import { getSpeakerProfileForCertificatesAction } from "@/features/certificates/mutations/speaker-profile.actions";
import type { SpeakerProfileDialogProps, SpeakerProfileLoadResult } from "@/features/certificates/types/speaker-profile.types";

export function SpeakerProfileDialog({ activityId, onClose, speakerId }: SpeakerProfileDialogProps) {
  const router = useRouter();
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<SpeakerProfileLoadResult>({});

  const load = useCallback(() => {
    return getSpeakerProfileForCertificatesAction(activityId, speakerId).then((next) => {
      setResult((current) => next.record ? next : { ...current, message: next.message });
    }).catch(() => {
      setResult((current) => ({ ...current, message: "No se pudo cargar el perfil. Revisa tu conexión y vuelve a intentar." }));
    }).finally(() => setLoading(false));
  }, [activityId, speakerId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element?.showModal();
    closeButton.current?.focus();
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  const saved = () => { setLoading(true); void load(); router.refresh(); };
  return createPortal(<dialog aria-labelledby={`${id}-title`} aria-modal="true" className="fixed inset-0 m-auto hidden max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-3xl flex-col overflow-hidden rounded-2xl border border-cci-200 bg-white p-0 text-cci-950 shadow-2xl backdrop:bg-cci-950/65 open:flex" onCancel={(event) => {
    event.preventDefault(); if (!busy) onClose();
  }} ref={dialog}>
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-cci-100 px-4 py-3 sm:px-6">
      <h2 className="text-lg font-bold" id={`${id}-title`}>Datos del ponente</h2>
      <Button disabled={busy} onClick={onClose} ref={closeButton} type="button" variant="secondary">Cerrar ×</Button>
    </header>
    <div aria-busy={loading} className="min-h-0 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-6">
      <p className="text-sm text-slate-600">Estos cambios actualizan el perfil compartido en Catálogos. No modifican el nombre impreso de certificados preparados o emitidos. El correo se usará al emitir; guardar el perfil no reenvía certificados anteriores.</p>
      {loading && !result.record ? <p className="py-8 text-center" role="status">Cargando datos del ponente…</p> : null}
      {result.message ? <div className="space-y-2 rounded-xl bg-amber-50 p-4"><p role="alert">{result.message}</p><Button disabled={loading} onClick={() => { setLoading(true); void load(); }} type="button" variant="secondary">Reintentar</Button></div> : null}
      {result.record ? <CatalogForm action={saveSpeakerProfileFromCertificatesAction.bind(null, activityId, speakerId)} inlineDocument kind="speakers" onDocumentSaved={saved} onPendingChange={setBusy} onSaved={saved} record={result.record} /> : null}
    </div>
  </dialog>, document.body);
}
