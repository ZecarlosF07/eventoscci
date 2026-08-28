"use client";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import { saveMaterialAction } from "@/features/courses/mutations/course-material.actions";
import type { MaterialFormProps } from "@/features/courses/components/MaterialForm/types/material-form.types";
import { usePersistentAction } from "@/hooks/use-persistent-action";

export function MaterialForm({ courseId, material }: MaterialFormProps) {
  const { onSubmit, pending, state } = usePersistentAction(saveMaterialAction, {});
  const fieldSuffix = material?.id ?? "new";
  return <form className="space-y-4 rounded-2xl border border-cci-100 bg-white p-5" method="post" onSubmit={onSubmit}>
    <input name="course_id" type="hidden" value={courseId} /><input name="material_id" type="hidden" value={material?.id ?? ""} /><input name="storage_path" type="hidden" value={material?.storage_path ?? ""} /><input name="mime_type" type="hidden" value={material?.mime_type ?? ""} /><input name="file_size_bytes" type="hidden" value={material?.file_size_bytes ?? ""} />
    <div className="grid gap-4 md:grid-cols-[1fr_180px_100px]"><FormField error={state.errors?.title?.[0]} label="Título" name={`material_title_${fieldSuffix}`}><Input defaultValue={material?.title} id={`material_title_${fieldSuffix}`} name="title" required /></FormField><FormField error={state.errors?.materialType?.[0]} label="Tipo" name={`material_type_${fieldSuffix}`}><Select defaultValue={material?.material_type ?? "external_link"} id={`material_type_${fieldSuffix}`} name="material_type"><option value="external_link">Enlace externo</option><option value="file">Archivo</option></Select></FormField><FormField error={state.errors?.sortOrder?.[0]} label="Orden" name={`material_order_${fieldSuffix}`}><Input defaultValue={material?.sort_order ?? 0} id={`material_order_${fieldSuffix}`} min="0" name="sort_order" type="number" /></FormField></div>
    <FormField error={state.errors?.description?.[0]} label="Descripción" name={`material_description_${fieldSuffix}`}><Textarea defaultValue={material?.description ?? ""} id={`material_description_${fieldSuffix}`} name="description" /></FormField>
    <div className="grid gap-4 md:grid-cols-2"><FormField error={state.errors?.externalUrl?.[0]} label="URL externa" name={`material_url_${fieldSuffix}`}><Input defaultValue={material?.external_url ?? ""} id={`material_url_${fieldSuffix}`} name="external_url" type="url" /></FormField><FormField error={state.errors?.file?.[0] ?? state.errors?.storagePath?.[0]} hint={material?.storage_path ? `Archivo actual: ${material.storage_path}` : "Máximo 50 MB."} label="Archivo" name={`material_file_${fieldSuffix}`}><Input id={`material_file_${fieldSuffix}`} name="file" type="file" /></FormField></div>
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"><FormActionNotice compact message={state.message} success={state.success} /><Button className="w-full sm:w-auto" disabled={pending} type="submit">{pending ? "Guardando…" : material ? "Actualizar" : "Agregar material"}</Button></div>
  </form>;
}
