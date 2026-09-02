"use client";

import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import { FormField } from "@/components/molecules/FormField";
import type { LessonFormProps } from "@/features/courses/components/LessonForm/types/lesson-form.types";
import { VIDEO_PROVIDER_OPTIONS } from "@/features/courses/constants/course.constants";
import { saveLessonAction } from "@/features/courses/mutations/course-content.actions";
import { usePersistentAction } from "@/hooks/use-persistent-action";

const LINK_PROVIDERS = VIDEO_PROVIDER_OPTIONS.filter((option) => option.value !== "supabase");

export function LessonForm({ courseId, defaultSortOrder = 0, lesson, moduleId }: LessonFormProps) {
  const { onSubmit, pending, state } = usePersistentAction(saveLessonAction, {});
  const [provider, setProvider] = useState(lesson?.video_provider ?? "youtube");
  const fieldSuffix = lesson?.id ?? `new_${moduleId}`;
  const sourceLabel = provider === "youtube" ? "URL o ID de YouTube" : provider === "vimeo" ? "URL o ID de Vimeo" : provider === "external" ? "URL directa del video" : "Ruta existente en Storage";
  const sourceHint = provider === "youtube" ? "Ej. https://youtu.be/... o dQw4w9WgXcQ" : provider === "vimeo" ? "Ej. https://vimeo.com/... o 76979871" : provider === "external" ? "Debe comenzar con https://" : "Esta opción solo se conserva para clases ya configuradas.";
  return (
    <form className="space-y-5" method="post" onSubmit={onSubmit}>
      <input name="course_id" type="hidden" value={courseId} /><input name="module_id" type="hidden" value={moduleId} /><input name="id" type="hidden" value={lesson?.id ?? ""} />
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_9rem]"><FormField error={state.errors?.title?.[0]} label="Título de la clase" name={`lesson_title_${fieldSuffix}`} required><Input defaultValue={lesson?.title} id={`lesson_title_${fieldSuffix}`} name="title" placeholder="Ej. Introducción y objetivos" required /></FormField><FormField error={state.errors?.sortOrder?.[0]} hint="0 aparece primero." label="Posición" name={`lesson_order_${fieldSuffix}`}><Input defaultValue={lesson?.sort_order ?? defaultSortOrder} id={`lesson_order_${fieldSuffix}`} min="0" name="sort_order" type="number" /></FormField></div>
      <FormField error={state.errors?.description?.[0]} hint="Se mostrará debajo del reproductor." label="Descripción" name={`lesson_description_${fieldSuffix}`}><Textarea defaultValue={lesson?.description ?? ""} id={`lesson_description_${fieldSuffix}`} name="description" /></FormField>
      <section className="rounded-2xl border border-cci-100 bg-cci-50 p-4 sm:p-5"><p className="font-semibold text-cci-950">Video de la clase</p><p className="mt-1 text-sm text-slate-600">Elige el servicio y pega su identificador o una URL directa.</p><div className="mt-4 grid gap-4 md:grid-cols-[13rem_minmax(0,1fr)_10rem]"><FormField error={state.errors?.videoProvider?.[0]} label="Origen" name={`lesson_provider_${fieldSuffix}`}><Select id={`lesson_provider_${fieldSuffix}`} name="video_provider" onChange={(event) => setProvider(event.target.value)} value={provider}>{LINK_PROVIDERS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}{provider === "supabase" ? <option value="supabase">Storage existente</option> : null}</Select></FormField><FormField error={provider === "supabase" ? state.errors?.videoStoragePath?.[0] : state.errors?.videoAssetId?.[0]} hint={sourceHint} label={sourceLabel} name={`lesson_source_${fieldSuffix}`}><Input defaultValue={provider === "supabase" ? lesson?.video_storage_path ?? "" : lesson?.video_asset_id ?? ""} id={`lesson_source_${fieldSuffix}`} key={provider} name={provider === "supabase" ? "video_storage_path" : "video_asset_id"} required /></FormField><FormField error={state.errors?.durationSeconds?.[0]} hint="Ej. 15" label="Duración (min)" name={`lesson_duration_${fieldSuffix}`}><Input defaultValue={lesson?.duration_seconds ? lesson.duration_seconds / 60 : ""} id={`lesson_duration_${fieldSuffix}`} min="0.1" name="duration_minutes" step="0.1" type="number" /></FormField></div></section>
      {provider === "supabase" ? <input name="video_asset_id" type="hidden" value="" /> : <input name="video_storage_path" type="hidden" value="" />}
      <div className="flex flex-wrap gap-6"><Label className="flex items-center gap-2"><Checkbox defaultChecked={lesson?.is_required ?? true} name="is_required" /> Clase obligatoria</Label><Label className="flex items-center gap-2"><Checkbox defaultChecked={lesson?.is_published} name="is_published" /> Visible para alumnos</Label></div>
      <div className="flex flex-col-reverse gap-3 border-t border-cci-100 pt-5 sm:flex-row sm:items-center sm:justify-between"><FormActionNotice compact message={state.message} success={state.success} /><Button className="w-full sm:w-auto" disabled={pending} type="submit">{pending ? "Guardando…" : lesson ? "Guardar clase" : "Crear clase"}</Button></div>
    </form>
  );
}
