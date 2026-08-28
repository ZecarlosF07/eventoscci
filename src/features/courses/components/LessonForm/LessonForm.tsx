"use client";

import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import { VIDEO_PROVIDER_OPTIONS } from "@/features/courses/constants/course.constants";
import { saveLessonAction } from "@/features/courses/mutations/course-content.actions";
import type { LessonFormProps } from "@/features/courses/components/LessonForm/types/lesson-form.types";
import { usePersistentAction } from "@/hooks/use-persistent-action";

export function LessonForm({ courseId, lesson, moduleId }: LessonFormProps) {
  const { onSubmit, pending, state } = usePersistentAction(saveLessonAction, {});
  const fieldSuffix = lesson?.id ?? `new_${moduleId}`;
  return <form className="space-y-4 rounded-xl border border-cci-100 bg-cci-50 p-4" method="post" onSubmit={onSubmit}>
    <input name="course_id" type="hidden" value={courseId} /><input name="module_id" type="hidden" value={moduleId} /><input name="id" type="hidden" value={lesson?.id ?? ""} />
    <div className="grid gap-3 md:grid-cols-[1fr_100px]"><FormField error={state.errors?.title?.[0]} label="Clase" name={`lesson_title_${fieldSuffix}`}><Input defaultValue={lesson?.title} id={`lesson_title_${fieldSuffix}`} name="title" required /></FormField><FormField error={state.errors?.sortOrder?.[0]} label="Orden" name={`lesson_order_${fieldSuffix}`}><Input defaultValue={lesson?.sort_order ?? 0} id={`lesson_order_${fieldSuffix}`} min="0" name="sort_order" type="number" /></FormField></div>
    <FormField error={state.errors?.description?.[0]} label="Descripción" name={`lesson_description_${fieldSuffix}`}><Textarea defaultValue={lesson?.description ?? ""} id={`lesson_description_${fieldSuffix}`} name="description" /></FormField>
    <div className="grid gap-3 md:grid-cols-3"><FormField error={state.errors?.videoProvider?.[0]} label="Proveedor" name={`lesson_provider_${fieldSuffix}`}><Select defaultValue={lesson?.video_provider ?? "youtube"} id={`lesson_provider_${fieldSuffix}`} name="video_provider">{VIDEO_PROVIDER_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select></FormField><FormField error={state.errors?.videoAssetId?.[0]} hint="ID de YouTube/Vimeo o URL HTTPS." label="ID o URL" name={`lesson_asset_${fieldSuffix}`}><Input defaultValue={lesson?.video_asset_id ?? ""} id={`lesson_asset_${fieldSuffix}`} name="video_asset_id" /></FormField><FormField error={state.errors?.videoStoragePath?.[0]} label="Ruta en Storage" name={`lesson_storage_${fieldSuffix}`}><Input defaultValue={lesson?.video_storage_path ?? ""} id={`lesson_storage_${fieldSuffix}`} name="video_storage_path" /></FormField></div>
    <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_auto]"><FormField error={state.errors?.durationSeconds?.[0]} label="Duración (segundos)" name={`lesson_duration_${fieldSuffix}`}><Input defaultValue={lesson?.duration_seconds ?? ""} id={`lesson_duration_${fieldSuffix}`} min="1" name="duration_seconds" type="number" /></FormField><div className="flex flex-wrap items-end gap-5 pb-3"><Label className="flex items-center gap-2"><Checkbox defaultChecked={lesson?.is_required ?? true} name="is_required" /> Obligatoria</Label><Label className="flex items-center gap-2"><Checkbox defaultChecked={lesson?.is_published} name="is_published" /> Publicada</Label></div><div className="flex items-end"><Button className="w-full lg:w-auto" disabled={pending} type="submit">{pending ? "Guardando…" : lesson ? "Actualizar" : "Agregar clase"}</Button></div></div>
    <FormActionNotice compact message={state.message} success={state.success} />
  </form>;
}
