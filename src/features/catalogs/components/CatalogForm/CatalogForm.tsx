"use client";

import { Button } from "@/components/atoms/Button";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import { CatalogFormFields } from "@/features/catalogs/components/CatalogForm/CatalogFormFields";
import type { CatalogFormProps } from "@/features/catalogs/components/CatalogForm/types/catalog-form.types";
import { saveCatalogAction } from "@/features/catalogs/mutations/catalog.actions";
import type { QuickCatalogResult } from "@/features/catalogs/types/catalog.types";
import type { StagedImageField } from "@/features/media/types/staged-image.types";
import { SPEAKER_IMAGE_BUCKET } from "@/features/speakers/constants/speaker.constants";
import { useStagedImageAction } from "@/hooks/use-staged-image-action";

const INITIAL_STATE: QuickCatalogResult = {};
const SPEAKER_IMAGE_FIELDS: StagedImageField[] = [{ field: "photo", label: "La fotografía", stagedField: "photo_staged_path" }];

export function CatalogForm({ kind, record }: CatalogFormProps) {
  const { onSubmit, pending, state, uploading } = useStagedImageAction({
    action: saveCatalogAction,
    bucket: SPEAKER_IMAGE_BUCKET,
    fields: kind === "speakers" ? SPEAKER_IMAGE_FIELDS : [],
    initialState: INITIAL_STATE,
  });
  return <form className="space-y-6 rounded-3xl border border-cci-100 bg-white p-5 shadow-sm sm:p-7" encType="multipart/form-data" method="post" onSubmit={onSubmit}><input name="kind" type="hidden" value={kind} /><input name="id" type="hidden" value={record?.id ?? ""} /><CatalogFormFields errors={state.errors} kind={kind} record={record} /><FormActionNotice message={state.message} /><div className="flex justify-end"><Button disabled={pending} type="submit">{uploading ? "Subiendo imagen…" : pending ? "Guardando…" : "Guardar registro"}</Button></div></form>;
}
