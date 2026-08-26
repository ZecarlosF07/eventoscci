"use client";

import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import { ActivityDateFields } from "@/features/activities/components/ActivityDateFields";
import { ActivityFormSection } from "@/features/activities/components/ActivityFormSection";
import { ActivitySpeakerFields } from "@/features/activities/components/ActivitySpeakerFields";
import { ACTIVITY_STATUS_LABELS } from "@/features/activities/constants/activity.constants";
import { saveActivityAction } from "@/features/activities/mutations/activity.actions";
import type {
  ActivityFormProps,
  ActivityFormState,
} from "@/features/activities/types/activity-form.types";
import { formatDateTimeLocal } from "@/features/activities/utils/activity-formatters";
import { usePersistentAction } from "@/hooks/use-persistent-action";

const INITIAL_STATE: ActivityFormState = {};

export function ActivityForm({
  activity,
  categories,
  speakers,
  type,
}: ActivityFormProps) {
  const { onSubmit, pending, state } = usePersistentAction(saveActivityAction, INITIAL_STATE);
  const error = (name: string) => state.errors?.[name]?.[0];
  const selectedSpeakers = activity?.speakers.map((speaker) => ({
    role_label: speaker.roleLabel ?? "",
    sort_order: speaker.sortOrder,
    speaker_id: speaker.id,
  })) ?? [];
  const initialDates = activity?.dates.map((date) => ({
    ends_at: formatDateTimeLocal(date.ends_at),
    label: date.label ?? "",
    sort_order: date.sort_order,
    starts_at: formatDateTimeLocal(date.starts_at),
  })) ?? [];

  return (
    <form className="space-y-6" method="post" onSubmit={onSubmit}>
      <input name="id" type="hidden" value={state.savedId ?? activity?.id ?? ""} />
      <input name="type" type="hidden" value={type} />
      <ActivityFormSection title="Información general">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField error={error("title")} label="Título" name="title" required>
            <Input defaultValue={activity?.title} id="title" name="title" required />
          </FormField>
          <FormField error={error("slug")} hint="Déjalo vacío para generarlo desde el título." label="Slug" name="slug">
            <Input defaultValue={activity?.slug} id="slug" name="slug" />
          </FormField>
          <FormField label="Categoría" name="category_id">
            <Select defaultValue={activity?.category_id ?? ""} id="category_id" name="category_id">
              <option value="">Sin categoría</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </Select>
          </FormField>
          <FormField error={error("modality")} label="Modalidad" name="modality" required>
            <Select defaultValue={activity?.modality ?? "in_person"} id="modality" name="modality" required>
              <option value="in_person">Presencial</option>
              <option value="virtual">Virtual</option>
              <option value="hybrid">Híbrida</option>
            </Select>
          </FormField>
        </div>
        <FormField error={error("short_description")} label="Descripción corta" name="short_description">
          <Textarea defaultValue={activity?.short_description ?? ""} id="short_description" maxLength={280} name="short_description" />
        </FormField>
        <FormField error={error("description")} label="Descripción" name="description" required>
          <Textarea defaultValue={activity?.description} id="description" name="description" required />
        </FormField>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Objetivo" name="objective"><Textarea defaultValue={activity?.objective ?? ""} id="objective" name="objective" /></FormField>
          <FormField label="Público objetivo" name="target_audience"><Textarea defaultValue={activity?.target_audience ?? ""} id="target_audience" name="target_audience" /></FormField>
        </div>
      </ActivityFormSection>

      <ActivityFormSection description="Completa lo que corresponda a presencial, virtual o híbrida." title="Modalidad y duración">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField error={error("location_name")} label="Lugar" name="location_name"><Input defaultValue={activity?.location_name ?? ""} id="location_name" name="location_name" /></FormField>
          <FormField label="Dirección" name="address"><Input defaultValue={activity?.address ?? ""} id="address" name="address" /></FormField>
          <FormField error={error("virtual_url")} label="Enlace virtual" name="virtual_url"><Input defaultValue={activity?.virtual_url ?? ""} id="virtual_url" name="virtual_url" type="url" /></FormField>
          <FormField label="Duración" name="duration_text"><Input defaultValue={activity?.duration_text ?? ""} id="duration_text" name="duration_text" /></FormField>
          <FormField error={error("academic_hours")} label="Horas académicas" name="academic_hours"><Input defaultValue={activity?.academic_hours ?? ""} id="academic_hours" min="0" name="academic_hours" step="0.5" type="number" /></FormField>
        </div>
      </ActivityFormSection>

      <ActivityFormSection title="Contenido">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Programa o agenda" name="program"><Textarea defaultValue={activity?.program ?? ""} id="program" name="program" /></FormField>
          <FormField label="Temario" name="syllabus"><Textarea defaultValue={activity?.syllabus ?? ""} id="syllabus" name="syllabus" /></FormField>
        </div>
        <FormField error={error("banner")} hint="JPG, PNG o WebP. Máximo 5 MB." label="Banner" name="banner">
          <Input accept="image/jpeg,image/png,image/webp" id="banner" name="banner" type="file" />
        </FormField>
        <input name="banner_path" type="hidden" value={activity?.banner_path ?? ""} />
      </ActivityFormSection>

      <ActivityFormSection title="Fechas y horarios">
        {error("dates") ? <p className="text-sm font-medium text-rose-700">{error("dates")}</p> : null}
        <ActivityDateFields initialDates={initialDates} />
      </ActivityFormSection>

      <ActivityFormSection title="Expositores">
        <ActivitySpeakerFields initialSpeakers={selectedSpeakers} speakers={speakers} />
      </ActivityFormSection>

      <ActivityFormSection title="Precio, asociados y cupos">
        <div className="grid gap-5 md:grid-cols-3">
          <FormField error={error("general_price")} label="Precio general" name="general_price"><Input defaultValue={activity?.general_price ?? 0} id="general_price" min="0" name="general_price" step="0.01" type="number" /></FormField>
          <FormField error={error("member_price")} label="Precio asociado" name="member_price"><Input defaultValue={activity?.member_price ?? 0} id="member_price" min="0" name="member_price" step="0.01" type="number" /></FormField>
          <FormField error={error("capacity")} hint="Vacío significa sin límite." label="Cupos" name="capacity"><Input defaultValue={activity?.capacity ?? ""} id="capacity" min="1" name="capacity" type="number" /></FormField>
        </div>
        <div className="flex flex-wrap gap-6">
          <Label className="flex items-center gap-2" htmlFor="is_free"><Checkbox defaultChecked={activity?.is_free} id="is_free" name="is_free" /> Actividad gratuita</Label>
          <Label className="flex items-center gap-2" htmlFor="members_only"><Checkbox defaultChecked={activity?.members_only} id="members_only" name="members_only" /> Exclusiva para asociados</Label>
        </div>
      </ActivityFormSection>

      <ActivityFormSection title="Inscripciones y contacto">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Apertura de inscripción" name="registration_open_at"><Input defaultValue={formatDateTimeLocal(activity?.registration_open_at ?? null)} id="registration_open_at" name="registration_open_at" type="datetime-local" /></FormField>
          <FormField error={error("registration_close_at")} label="Cierre de inscripción" name="registration_close_at"><Input defaultValue={formatDateTimeLocal(activity?.registration_close_at ?? null)} id="registration_close_at" name="registration_close_at" type="datetime-local" /></FormField>
          <FormField label="Responsable" name="contact_name"><Input defaultValue={activity?.contact_name ?? ""} id="contact_name" name="contact_name" /></FormField>
          <FormField label="Teléfono" name="contact_phone"><Input defaultValue={activity?.contact_phone ?? ""} id="contact_phone" name="contact_phone" /></FormField>
          <FormField error={error("contact_email")} label="Correo" name="contact_email"><Input defaultValue={activity?.contact_email ?? ""} id="contact_email" name="contact_email" type="email" /></FormField>
        </div>
        <Label className="flex items-center gap-2" htmlFor="registrations_closed_manually"><Checkbox defaultChecked={activity?.registrations_closed_manually} id="registrations_closed_manually" name="registrations_closed_manually" /> Inscripciones cerradas manualmente</Label>
        <FormField label="Información adicional" name="additional_info"><Textarea defaultValue={activity?.additional_info ?? ""} id="additional_info" name="additional_info" /></FormField>
      </ActivityFormSection>

      <div className="sticky bottom-4 flex flex-col gap-3 rounded-2xl border border-cci-100 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <FormField label="Estado al guardar" name="status">
          <Select defaultValue={activity?.status ?? "draft"} id="status" name="status">
            {Object.entries(ACTIVITY_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
        </FormField>
        <div className="space-y-2 sm:text-right">
          <FormActionNotice compact message={state.message} success={state.success} warning={state.warning} />
          <Button disabled={pending} type="submit">{pending ? "Guardando…" : activity ? "Guardar cambios" : "Crear actividad"}</Button>
        </div>
      </div>
    </form>
  );
}
