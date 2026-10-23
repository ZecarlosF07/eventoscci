"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import { FormField } from "@/components/molecules/FormField";
import { CatalogFormFields } from "@/features/catalogs/components/CatalogForm/CatalogFormFields";
import type { CatalogFormProps } from "@/features/catalogs/components/CatalogForm/types/catalog-form.types";
import { saveCatalogAction } from "@/features/catalogs/mutations/catalog.actions";
import type { QuickCatalogResult } from "@/features/catalogs/types/catalog.types";
import type { StagedImageField } from "@/features/media/types/staged-image.types";
import { SPEAKER_IMAGE_BUCKET } from "@/features/speakers/constants/speaker.constants";
import { SpeakerDocumentEditor } from "@/features/speakers/components/SpeakerDocumentEditor/SpeakerDocumentEditor";
import { useStagedImageAction } from "@/hooks/use-staged-image-action";

const INITIAL_STATE: QuickCatalogResult = {};
const SPEAKER_IMAGE_FIELDS: StagedImageField[] = [{ field: "photo", label: "La fotografía", stagedField: "photo_staged_path" }];

export function CatalogForm({ action = saveCatalogAction, inlineDocument = false, kind, onDocumentSaved, onPendingChange, onSaved, record }: CatalogFormProps) {
  const [documentPending, setDocumentPending] = useState(false);
  const { onSubmit, pending, state, uploading } = useStagedImageAction({
    action: async (previous, formData) => {
      try {
        const result = await action(previous, formData);
        if (result.success) onSaved?.();
        return result;
      } catch (error) {
        // Let Next.js handle successful redirects in the standard catalog form.
        if (action === saveCatalogAction) throw error;
        return { message: "No se pudo guardar el perfil. Revisa tu conexión e inténtalo de nuevo." };
      }
    },
    bucket: SPEAKER_IMAGE_BUCKET,
    fields: kind === "speakers" ? SPEAKER_IMAGE_FIELDS : [],
    initialState: INITIAL_STATE,
  });
  useEffect(() => { onPendingChange?.(pending || documentPending); }, [documentPending, onPendingChange, pending]);
  return <div className="space-y-5">
    {record && "documentContext" in record ? <section aria-label="Identidad privada del ponente" className="rounded-2xl border border-cci-100 bg-white p-5">
      <h2 className="font-semibold">DNI del ponente</h2><p className="text-sm text-slate-600">Identidad privada para consultar certificados. Se guarda por separado de los datos del perfil.</p>
      <SpeakerDocumentEditor context={record.documentContext} disabled={pending} inline={inlineDocument} onPendingChange={setDocumentPending} onSaved={onDocumentSaved} speakerId={record.id} />
    </section> : null}
    <form className="space-y-6 rounded-3xl border border-cci-100 bg-white p-5 shadow-sm sm:p-7" encType="multipart/form-data" method="post" onSubmit={(event) => { event.stopPropagation(); onSubmit(event); }}>
      <fieldset className="space-y-6" disabled={pending || documentPending}>
      <input name="kind" type="hidden" value={kind} /><input name="id" type="hidden" value={record?.id ?? ""} />
      <CatalogFormFields contactFirst={inlineDocument} errors={state.errors} kind={kind} record={record} />
      {kind === "speakers" && !record ? <FormField error={state.errors?.document_number?.[0]} hint="Opcional al crear el perfil; necesario para emitir certificados. No se muestra en el perfil público." label="DNI del ponente" name="document_number"><Input autoComplete="off" id="document_number" inputMode="numeric" maxLength={8} name="document_number" pattern="[0-9]{8}" /></FormField> : null}
      <FormActionNotice message={state.message} success={state.success} />
      {state.conflict ? <a className="inline-flex min-h-11 items-center font-semibold underline" href={`/admin/catalogos/ponentes/${state.conflict.speakerId}`}>Revisar perfil de {state.conflict.name}</a> : null}
      <div className="flex justify-end"><Button disabled={pending} type="submit">{uploading ? "Subiendo imagen…" : pending ? "Guardando…" : "Guardar registro"}</Button></div>
      </fieldset>
    </form>
  </div>;
}
