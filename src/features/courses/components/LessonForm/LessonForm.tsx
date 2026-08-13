"use client";

import { useActionState } from "react";
import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { VIDEO_PROVIDER_OPTIONS } from "@/features/courses/constants/course.constants";
import { saveLessonAction } from "@/features/courses/mutations/course-content.actions";
import type { LessonFormProps } from "@/features/courses/components/LessonForm/types/lesson-form.types";

export function LessonForm({ courseId, lesson, moduleId }: LessonFormProps) {
  const [state, action, pending] = useActionState(saveLessonAction, {});
  const fieldSuffix = lesson?.id ?? `new_${moduleId}`;
  return <form action={action} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
    <input name="course_id" type="hidden" value={courseId} /><input name="module_id" type="hidden" value={moduleId} /><input name="id" type="hidden" value={lesson?.id ?? ""} />
    <div className="grid gap-3 md:grid-cols-[1fr_100px]"><FormField error={state.errors?.title?.[0]} label="Clase" name={`lesson_title_${fieldSuffix}`}><Input defaultValue={lesson?.title} id={`lesson_title_${fieldSuffix}`} name="title" required /></FormField><FormField label="Orden" name={`lesson_order_${fieldSuffix}`}><Input defaultValue={lesson?.sort_order ?? 0} id={`lesson_order_${fieldSuffix}`} min="0" name="sort_order" type="number" /></FormField></div>
    <FormField label="Descripción" name={`lesson_description_${fieldSuffix}`}><Textarea defaultValue={lesson?.description ?? ""} id={`lesson_description_${fieldSuffix}`} name="description" /></FormField>
    <div className="grid gap-3 md:grid-cols-3"><FormField label="Proveedor" name={`lesson_provider_${fieldSuffix}`}><Select defaultValue={lesson?.video_provider ?? "youtube"} id={`lesson_provider_${fieldSuffix}`} name="video_provider">{VIDEO_PROVIDER_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select></FormField><FormField error={state.errors?.videoAssetId?.[0]} hint="ID de YouTube/Vimeo o URL HTTPS." label="ID o URL" name={`lesson_asset_${fieldSuffix}`}><Input defaultValue={lesson?.video_asset_id ?? ""} id={`lesson_asset_${fieldSuffix}`} name="video_asset_id" /></FormField><FormField label="Ruta en Storage" name={`lesson_storage_${fieldSuffix}`}><Input defaultValue={lesson?.video_storage_path ?? ""} id={`lesson_storage_${fieldSuffix}`} name="video_storage_path" /></FormField></div>
    <div className="grid gap-3 md:grid-cols-[180px_1fr_auto]"><FormField error={state.errors?.durationSeconds?.[0]} label="Duración (segundos)" name={`lesson_duration_${fieldSuffix}`}><Input defaultValue={lesson?.duration_seconds ?? ""} id={`lesson_duration_${fieldSuffix}`} min="1" name="duration_seconds" type="number" /></FormField><div className="flex flex-wrap items-end gap-5 pb-3"><Label className="flex items-center gap-2"><Checkbox defaultChecked={lesson?.is_required ?? true} name="is_required" /> Obligatoria</Label><Label className="flex items-center gap-2"><Checkbox defaultChecked={lesson?.is_published} name="is_published" /> Publicada</Label></div><div className="flex items-end"><Button disabled={pending} type="submit">{pending ? "Guardando…" : lesson ? "Actualizar" : "Agregar clase"}</Button></div></div>
    {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}
  </form>;
}
