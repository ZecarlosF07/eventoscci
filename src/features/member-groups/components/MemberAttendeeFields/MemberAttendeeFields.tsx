"use client";

import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import type { MemberAttendeeFieldsProps } from "@/features/member-groups/types/member-group.types";

export function MemberAttendeeFields({ attendee, certificateMode, certificatePrice, errors = {}, index, onChange, onRemove }: MemberAttendeeFieldsProps) {
  const update = (patch: Partial<typeof attendee>) => onChange({ ...attendee, ...patch });
  const prefix = `attendee-${index}`;
  return (
    <fieldset className="space-y-4 rounded-2xl border border-cci-100 bg-white p-4 sm:p-5">
      <legend className="px-1 text-lg font-bold text-cci-950">{index === 0 ? "Persona responsable" : `Asistente adicional ${index}`}</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField error={errors.document_type} label="Tipo de documento" name={`${prefix}-document-type`} required>
          <Select id={`${prefix}-document-type`} value={attendee.document_type} onChange={(event) => update({ document_type: event.target.value as "dni" | "ce" })}>
            <option value="dni">DNI</option><option value="ce">Carné de Extranjería</option>
          </Select>
        </FormField>
        <FormField error={errors.document_number} label="Número de documento" name={`${prefix}-document-number`} required>
          <Input aria-invalid={Boolean(errors.document_number)} id={`${prefix}-document-number`} inputMode={attendee.document_type === "dni" ? "numeric" : "text"} maxLength={20} required value={attendee.document_number} onChange={(event) => update({ document_number: event.target.value })} />
        </FormField>
        <FormField error={errors.first_names} label="Nombres" name={`${prefix}-first-names`} required>
          <Input aria-invalid={Boolean(errors.first_names)} id={`${prefix}-first-names`} autoComplete={index === 0 ? "given-name" : "off"} maxLength={120} required value={attendee.first_names} onChange={(event) => update({ first_names: event.target.value })} />
        </FormField>
        <FormField error={errors.last_names} label="Apellidos" name={`${prefix}-last-names`} required>
          <Input aria-invalid={Boolean(errors.last_names)} id={`${prefix}-last-names`} autoComplete={index === 0 ? "family-name" : "off"} maxLength={120} required value={attendee.last_names} onChange={(event) => update({ last_names: event.target.value })} />
        </FormField>
        <FormField error={errors.email} label="Correo electrónico" name={`${prefix}-email`} required>
          <Input aria-invalid={Boolean(errors.email)} id={`${prefix}-email`} autoComplete={index === 0 ? "email" : "off"} type="email" maxLength={320} required value={attendee.email} onChange={(event) => update({ email: event.target.value })} />
        </FormField>
        <FormField error={errors.phone} label="Celular" name={`${prefix}-phone`} required>
          <Input aria-invalid={Boolean(errors.phone)} id={`${prefix}-phone`} autoComplete={index === 0 ? "tel" : "off"} type="tel" inputMode="tel" maxLength={20} required value={attendee.phone} onChange={(event) => update({ phone: event.target.value })} />
        </FormField>
        <FormField error={errors.job_title} label="Cargo" name={`${prefix}-job-title`} required>
          <Input aria-invalid={Boolean(errors.job_title)} id={`${prefix}-job-title`} maxLength={150} required value={attendee.job_title} onChange={(event) => update({ job_title: event.target.value })} />
        </FormField>
      </div>
      {certificateMode === "optional_paid" ? (
        <label className="flex min-h-11 items-center gap-3 text-sm text-cci-950">
          <input type="checkbox" checked={attendee.request_certificate} onChange={(event) => update({ request_certificate: event.target.checked })} />
          Solicitar certificado para esta persona (S/ {certificatePrice.toFixed(2)} adicionales, pago separado)
        </label>
      ) : null}
      {onRemove ? <button type="button" className="min-h-11 text-sm font-bold text-rose-700 underline underline-offset-4" onClick={onRemove}>Quitar a esta persona</button> : null}
    </fieldset>
  );
}
