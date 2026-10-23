"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { saveSpeakerDocumentAction } from "@/features/speakers/mutations/speaker-document.actions";
import type { SpeakerDocumentEditorProps, SpeakerDocumentState } from "@/features/speakers/types/speaker-document.types";

export function SpeakerDocumentEditor({ context, disabled = false, inline = false, onPendingChange, onSaved, speakerId }: SpeakerDocumentEditorProps) {
  const router = useRouter();
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [documentNumber, setDocumentNumber] = useState(context.documentNumber ?? "");
  const [state, setState] = useState<SpeakerDocumentState>({});
  const [pending, startTransition] = useTransition();
  const correction = Boolean(context.documentNumber && context.hasCertificates);

  useEffect(() => {
    if (!open) return;
    if (inline) document.getElementById(`${id}-document`)?.focus();
    else dialog.current?.showModal();
  }, [id, inline, open]);

  useEffect(() => { onPendingChange?.(pending); }, [onPendingChange, pending]);

  function close() {
    dialog.current?.close();
    setOpen(false);
    trigger.current?.focus();
  }

  const editor = <form className="space-y-5" onSubmit={(event) => {
        event.preventDefault(); event.stopPropagation();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
          try {
            const result = await saveSpeakerDocumentAction(formData);
            setState(result);
            if (result.success) { close(); onSaved?.(); router.refresh(); }
          } catch { setState({ message: "No se pudo guardar. Revisa tu conexión y vuelve a intentarlo." }); }
        });
      }}>
        <h2 className="text-xl font-semibold" id={`${id}-title`}>{context.documentNumber ? "Corregir DNI del ponente" : "Completar DNI del ponente"}</h2>
        <p className="text-sm text-slate-600">Este documento habilita la consulta de todo su historial por DNI y en el Campus. No modifica el nombre impreso ni los PDF.</p>
        <input name="speaker_id" type="hidden" value={speakerId} />
        <input name="expected_document" type="hidden" value={context.documentNumber ?? ""} />
        <FormField error={state.errors?.documentNumber?.[0]} hint="Solo DNI peruano de ocho dígitos. Se conservan los ceros iniciales." label="DNI del ponente" name={`${id}-document`} required={context.hasCertificates}>
          <Input autoComplete="off" disabled={pending} id={`${id}-document`} inputMode="numeric" maxLength={8} name="document_number" onChange={(event) => setDocumentNumber(event.target.value)} pattern="[0-9]{8}" required={context.hasCertificates} value={documentNumber} />
        </FormField>
        {context.documentNumber ? <FormField label="Motivo de la corrección" name={`${id}-reason`} required={correction}>
          <Textarea disabled={pending} id={`${id}-reason`} maxLength={500} minLength={correction ? 5 : undefined} name="reason" required={correction} />
        </FormField> : null}
        {correction ? <label className="flex min-h-11 items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
          <input className="mt-1 size-4 shrink-0" disabled={pending} name="confirm_history" required type="checkbox" />
          <span>Confirmo que todo el historial dejará de estar asociado al DNI {context.documentNumber} y pasará al nuevo DNI. Verifiqué la identidad del ponente.</span>
        </label> : null}
        {state.message ? <p aria-live="polite" className="text-sm text-rose-700">{state.message}</p> : null}
        {state.conflict ? <Link className="inline-flex min-h-11 items-center font-semibold underline" href={`/admin/catalogos/ponentes/${state.conflict.speakerId}`} target="_blank">Revisar perfil de {state.conflict.name} (nueva pestaña)</Link> : null}
        <div className="flex flex-wrap justify-end gap-3">
          <Button disabled={pending} onClick={close} type="button" variant="secondary">Cancelar</Button>
          <Button disabled={pending || documentNumber === (context.documentNumber ?? "")} type="submit">{pending ? "Guardando…" : "Guardar DNI"}</Button>
        </div>
      </form>;

  return <div className="mt-2 space-y-1">
    <p className="text-xs font-medium text-slate-600">{context.documentNumber ? `DNI: ${context.documentNumber}` : "DNI pendiente · necesario para emitir"}</p>
    {!disabled && context.canCorrect ? <button aria-expanded={open} className="min-h-11 text-sm font-semibold text-cci-800 underline underline-offset-4 focus-visible:outline-2" onClick={() => {
      if (open) { close(); return; }
      setState({}); setDocumentNumber(context.documentNumber ?? ""); setOpen(true);
    }} ref={trigger} type="button">{context.documentNumber ? "Corregir DNI" : "Completar DNI"}</button> : null}
    {!disabled && !context.canCorrect ? <p className="text-xs text-slate-600">Corrección solo por administrador.</p> : null}
    {!open && state.message ? <p role="status" className="text-xs text-cci-800">{state.message}</p> : null}
    {open && inline ? <section aria-labelledby={`${id}-title`} className="mt-4 rounded-xl border border-cci-200 bg-cci-50 p-4">{editor}</section> : null}
    {open && !inline ? createPortal(<dialog aria-labelledby={`${id}-title`} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl border border-cci-100 bg-white p-6 text-cci-950 shadow-xl backdrop:bg-cci-950/70" onCancel={(event) => {
      if (pending) event.preventDefault();
    }} onClose={close} ref={dialog}>{editor}</dialog>, document.body) : null}
  </div>;
}
