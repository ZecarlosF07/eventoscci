"use client";

import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import { FIELD_LIMITS } from "@/constants/field-limits";
import { ActivityContentFields } from "@/features/activities/components/ActivityContentFields";
import { ActivityCertificateFields } from "@/features/activities/components/ActivityCertificateFields";
import { ActivityDateFields } from "@/features/activities/components/ActivityDateFields";
import { ActivityFormSection } from "@/features/activities/components/ActivityFormSection";
import { ActivityPricingFields } from "@/features/activities/components/ActivityPricingFields";
import { ActivityRegistrationPauseField } from "@/features/activities/components/ActivityRegistrationPauseField";
import { ActivitySpeakerFields } from "@/features/activities/components/ActivitySpeakerFields";
import { ActivityVirtualAccessFields } from "@/features/activities/components/ActivityVirtualAccessFields";
import { CatalogSelect } from "@/features/catalogs/components/CatalogSelect";
import { ACTIVITY_STATUS_LABELS } from "@/features/activities/constants/activity.constants";
import { useActivityFormSubmission } from "@/features/activities/hooks/use-activity-form-submission";
import type {
  ActivityFormProps,
  ActivityFormState,
} from "@/features/activities/types/activity-form.types";
import { formatDateTimeLocal } from "@/features/activities/utils/activity-formatters";

const INITIAL_STATE: ActivityFormState = {};

export function ActivityForm({
  activity,
  categories,
  contacts,
  speakers,
  type,
  venues,
}: ActivityFormProps) {
  const { onSubmit, pending, state, uploadLabel } = useActivityFormSubmission(INITIAL_STATE);
  const [modality, setModality] = useState(activity?.modality ?? "in_person");
  const [status, setStatus] = useState(activity?.status ?? "draft");
  const isArchived = activity?.status === "archived";
  const [isFree, setIsFree] = useState(activity?.is_free ?? false);
  const [membersOnly, setMembersOnly] = useState(activity?.members_only ?? false);
  const [registrationsPaused, setRegistrationsPaused] = useState(activity?.registrations_closed_manually ?? false);
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
          <FormField error={error("title")} hint={`Máximo ${FIELD_LIMITS.activityTitle} caracteres.`} label="Título" name="title" required>
            <Input defaultValue={activity?.title} id="title" maxLength={FIELD_LIMITS.activityTitle} name="title" required />
          </FormField>
          <FormField error={error("slug")} hint="Déjalo vacío para generarlo desde el título." label="Slug" name="slug">
            <Input defaultValue={activity?.slug} id="slug" maxLength={FIELD_LIMITS.activitySlug} name="slug" />
          </FormField>
          <CatalogSelect defaultValue={activity?.category_id ?? ""} error={error("category_id")} kind="categories" label="Categoría" name="category_id" options={categories.map((category) => ({ id: category.id, label: category.name }))} />
          <FormField error={error("modality")} label="Modalidad" name="modality" required>
            <Select id="modality" name="modality" onChange={(event) => setModality(event.target.value as typeof modality)} required value={modality}>
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
          {modality !== "virtual" ? <CatalogSelect defaultValue={activity?.venue_id ?? ""} error={error("venue_id")} kind="venues" label="Lugar" name="venue_id" options={venues.map((venue) => ({ description: venue.address, id: venue.id, label: venue.name }))} required={status === "published"} /> : <input name="venue_id" type="hidden" value="" />}
          <ActivityVirtualAccessFields defaultValue={activity?.virtual_url} error={error("virtual_url")} modality={modality} published={status === "published"} />
          <FormField error={error("duration_text")} hint="Texto resumido que verá el público, por ejemplo: 5 horas, 2 días o 4 sesiones; máximo 100 caracteres." label="Duración mostrada al público" name="duration_text"><Input defaultValue={activity?.duration_text ?? ""} id="duration_text" maxLength={FIELD_LIMITS.activityDuration} name="duration_text" placeholder="Ej. 2 días" /></FormField>
        </div>
      </ActivityFormSection>

      <ActivityFormSection title="Contenido">
        <ActivityContentFields activity={activity} bannerError={error("banner")} programError={error("program_images")} />
      </ActivityFormSection>

      <ActivityFormSection title="Fechas y horarios">
        {error("dates") ? <p className="text-sm font-medium text-rose-700">{error("dates")}</p> : null}
        <ActivityDateFields initialDates={initialDates} />
      </ActivityFormSection>

      <ActivityFormSection title="Expositores">
        {error("speakers") ? <p className="text-sm font-medium text-rose-700">{error("speakers")}</p> : null}
        <ActivitySpeakerFields initialSpeakers={selectedSpeakers} speakers={speakers} />
      </ActivityFormSection>

      <ActivityFormSection description="Define quién puede participar, si tiene costo y cuántas plazas hay." title="Participación y cupos">
        <ActivityPricingFields activity={activity} errors={state.errors} isFree={isFree} membersOnly={membersOnly} onFreeChange={setIsFree} onMembersOnlyChange={setMembersOnly} status={status} type={type} />
        <ActivityCertificateFields
          defaultAcademicHours={activity?.academic_hours}
          defaultGeneralPrice={activity?.certificate_general_price}
          defaultMemberPrice={activity?.certificate_member_price}
          defaultMode={activity?.certificate_mode}
          errors={state.errors}
          membersOnly={membersOnly}
          preserveHistoricalHours={isArchived}
        />
      </ActivityFormSection>

      <ActivityFormSection title="Inscripciones y contacto">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Apertura de inscripción" name="registration_open_at"><Input defaultValue={formatDateTimeLocal(activity?.registration_open_at ?? null)} id="registration_open_at" name="registration_open_at" type="datetime-local" /></FormField>
          <FormField error={error("registration_close_at")} label="Cierre de inscripción" name="registration_close_at"><Input defaultValue={formatDateTimeLocal(activity?.registration_close_at ?? null)} id="registration_close_at" name="registration_close_at" type="datetime-local" /></FormField>
          <CatalogSelect defaultValue={activity?.contact_id ?? contacts.find((contact) => contact.is_default)?.id ?? ""} error={error("contact_id")} kind="contacts" label="Contacto de atención" name="contact_id" options={contacts.map((contact) => ({ description: `${contact.contact_name} · ${contact.whatsapp_phone}`, id: contact.id, label: contact.label }))} required={status === "published"} />
        </div>
        <ActivityRegistrationPauseField checked={registrationsPaused} onChange={setRegistrationsPaused} visible={Boolean(activity && status === "published")} />
        <FormField label="Información adicional" name="additional_info"><Textarea defaultValue={activity?.additional_info ?? ""} id="additional_info" name="additional_info" /></FormField>
      </ActivityFormSection>

      <div className="sticky bottom-4 flex flex-col gap-3 rounded-2xl border border-cci-100 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <FormField label="Estado al guardar" name="status">
          <Select disabled={isArchived} id="status" name="status" onChange={(event) => setStatus(event.target.value as typeof status)} value={status}>
            {Object.entries(ACTIVITY_STATUS_LABELS).filter(([value]) => value !== "archived" || isArchived).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
          {isArchived ? <input name="status" type="hidden" value="archived" /> : null}
        </FormField>
        <div className="space-y-2 sm:text-right">
          <FormActionNotice compact message={state.message} success={state.success} warning={state.warning} />
          <Button disabled={pending} type="submit">{uploadLabel ?? (pending ? "Guardando…" : activity ? "Guardar cambios" : "Crear actividad")}</Button>
        </div>
      </div>
    </form>
  );
}
