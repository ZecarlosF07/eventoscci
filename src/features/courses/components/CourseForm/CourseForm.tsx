"use client";

import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import { ActivityFormSection } from "@/features/activities/components/ActivityFormSection";
import { CourseInstructorFields } from "@/features/courses/components/CourseInstructorFields";
import { COURSE_STATUS_LABELS } from "@/features/courses/constants/course.constants";
import { saveCourseAction } from "@/features/courses/mutations/course.actions";
import type { CourseFormProps, CourseFormState } from "@/features/courses/types/course-form.types";
import { usePersistentAction } from "@/hooks/use-persistent-action";

const INITIAL_STATE: CourseFormState = {};

export function CourseForm({ course, speakers }: CourseFormProps) {
  const { onSubmit, pending, state } = usePersistentAction(saveCourseAction, INITIAL_STATE);
  const error = (name: string) => state.errors?.[name]?.[0];
  const initialInstructors = course?.instructors.map((item) => ({
    is_primary: item.isPrimary,
    role_label: item.roleLabel ?? "",
    sort_order: item.sortOrder,
    speaker_id: item.speaker.id,
  })) ?? [];

  return <form className="space-y-6" method="post" onSubmit={onSubmit}>
    <input name="id" type="hidden" value={state.savedId ?? course?.id ?? ""} />
    <input name="banner_path" type="hidden" value={course?.banner_path ?? ""} />
    <ActivityFormSection title="Información general">
      <div className="grid gap-5 md:grid-cols-2">
        <FormField error={error("title")} label="Título" name="title" required><Input defaultValue={course?.title} id="title" name="title" required /></FormField>
        <FormField error={error("slug")} hint="Déjalo vacío para generarlo desde el título." label="Slug" name="slug"><Input defaultValue={course?.slug} id="slug" name="slug" /></FormField>
      </div>
      <FormField error={error("short_description")} label="Descripción corta" name="short_description"><Textarea defaultValue={course?.short_description ?? ""} id="short_description" maxLength={280} name="short_description" /></FormField>
      <FormField error={error("description")} label="Descripción" name="description" required><Textarea defaultValue={course?.description} id="description" name="description" required /></FormField>
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Objetivos" name="objectives"><Textarea defaultValue={course?.objectives ?? ""} id="objectives" name="objectives" /></FormField>
        <FormField label="Resumen de contenidos" name="contents_overview"><Textarea defaultValue={course?.contents_overview ?? ""} id="contents_overview" name="contents_overview" /></FormField>
      </div>
    </ActivityFormSection>
    <ActivityFormSection title="Duración y portada">
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Duración" name="duration_text"><Input defaultValue={course?.duration_text ?? ""} id="duration_text" name="duration_text" placeholder="Ej. 8 semanas" /></FormField>
        <FormField error={error("academic_hours")} label="Horas académicas" name="academic_hours"><Input defaultValue={course?.academic_hours ?? ""} id="academic_hours" min="0" name="academic_hours" step="0.5" type="number" /></FormField>
      </div>
      <FormField error={error("banner")} hint="JPG, PNG o WebP. Máximo 5 MB." label="Portada" name="banner"><Input accept="image/jpeg,image/png,image/webp" id="banner" name="banner" type="file" /></FormField>
    </ActivityFormSection>
    <ActivityFormSection title="Instructores"><CourseInstructorFields initialInstructors={initialInstructors} speakers={speakers} />{error("instructors") ? <p className="text-sm font-medium text-rose-700">{error("instructors")}</p> : null}</ActivityFormSection>
    <ActivityFormSection title="Precio y publicación">
      <div className="grid gap-5 md:grid-cols-3">
        <FormField error={error("general_price")} label="Precio general" name="general_price"><Input defaultValue={course?.general_price ?? 0} id="general_price" min="0" name="general_price" step="0.01" type="number" /></FormField>
        <FormField error={error("member_price")} label="Precio asociado" name="member_price"><Input defaultValue={course?.member_price ?? 0} id="member_price" min="0" name="member_price" step="0.01" type="number" /></FormField>
        <FormField label="Estado" name="status"><Select defaultValue={course?.status ?? "draft"} id="status" name="status">{Object.entries(COURSE_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></FormField>
      </div>
      <Label className="flex items-center gap-2" htmlFor="is_free"><Checkbox defaultChecked={course?.is_free} id="is_free" name="is_free" /> Curso gratuito</Label>
    </ActivityFormSection>
    <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-2xl border border-cci-100 bg-white/95 p-4 shadow-lg backdrop-blur">
      <FormActionNotice compact message={state.message} success={state.success} warning={state.warning} />
      <Button disabled={pending} type="submit">{pending ? "Guardando…" : course ? "Guardar cambios" : "Crear curso"}</Button>
    </div>
  </form>;
}
