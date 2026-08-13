"use client";

import { useActionState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { saveMaterialAction } from "@/features/courses/mutations/course-material.actions";
import type { MaterialFormProps } from "@/features/courses/components/MaterialForm/types/material-form.types";

export function MaterialForm({ courseId, material }: MaterialFormProps) {
  const [state, action, pending] = useActionState(saveMaterialAction, {});
  const fieldSuffix = material?.id ?? "new";
  return <form action={action} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
    <input name="course_id" type="hidden" value={courseId} /><input name="material_id" type="hidden" value={material?.id ?? ""} /><input name="storage_path" type="hidden" value={material?.storage_path ?? ""} /><input name="mime_type" type="hidden" value={material?.mime_type ?? ""} /><input name="file_size_bytes" type="hidden" value={material?.file_size_bytes ?? ""} />
    <div className="grid gap-4 md:grid-cols-[1fr_180px_100px]"><FormField error={state.errors?.title?.[0]} label="Título" name={`material_title_${fieldSuffix}`}><Input defaultValue={material?.title} id={`material_title_${fieldSuffix}`} name="title" required /></FormField><FormField label="Tipo" name={`material_type_${fieldSuffix}`}><Select defaultValue={material?.material_type ?? "external_link"} id={`material_type_${fieldSuffix}`} name="material_type"><option value="external_link">Enlace externo</option><option value="file">Archivo</option></Select></FormField><FormField label="Orden" name={`material_order_${fieldSuffix}`}><Input defaultValue={material?.sort_order ?? 0} id={`material_order_${fieldSuffix}`} min="0" name="sort_order" type="number" /></FormField></div>
    <FormField label="Descripción" name={`material_description_${fieldSuffix}`}><Textarea defaultValue={material?.description ?? ""} id={`material_description_${fieldSuffix}`} name="description" /></FormField>
    <div className="grid gap-4 md:grid-cols-2"><FormField error={state.errors?.externalUrl?.[0]} label="URL externa" name={`material_url_${fieldSuffix}`}><Input defaultValue={material?.external_url ?? ""} id={`material_url_${fieldSuffix}`} name="external_url" type="url" /></FormField><FormField error={state.errors?.file?.[0] ?? state.errors?.storagePath?.[0]} hint={material?.storage_path ? `Archivo actual: ${material.storage_path}` : "Máximo 50 MB."} label="Archivo" name={`material_file_${fieldSuffix}`}><Input id={`material_file_${fieldSuffix}`} name="file" type="file" /></FormField></div>
    <div className="flex items-center justify-between gap-3">{state.message ? <p className="text-sm text-slate-600">{state.message}</p> : <span />}<Button disabled={pending} type="submit">{pending ? "Guardando…" : material ? "Actualizar" : "Agregar material"}</Button></div>
  </form>;
}
