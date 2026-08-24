"use client";

import { useActionState } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import type { ParticipantFormProps } from "@/features/participants/components/ParticipantForm/types/participant-form.types";
import { updateParticipantAction } from "@/features/participants/mutations/participant.actions";
import type { ParticipantFormState } from "@/features/participants/types/participant.types";

const INITIAL_STATE: ParticipantFormState = {};

export function ParticipantForm({ participant }: ParticipantFormProps) {
  const actionWithId = updateParticipantAction.bind(null, participant.id);
  const [state, action, pending] = useActionState(actionWithId, INITIAL_STATE);
  return (
    <form action={action} className="grid gap-5 rounded-3xl border border-cci-100 bg-white p-6 md:grid-cols-2">
      <div className="md:col-span-2 rounded-xl bg-cci-50 px-4 py-3 text-sm text-slate-700">
        Identidad: <strong>{participant.document_type.toUpperCase()} {participant.document_number}</strong>. El documento no se modifica desde esta ficha.
      </div>
      <FormField error={state.errors?.first_names?.[0]} label="Nombres" name="first_names" required><Input defaultValue={participant.first_names} id="first_names" name="first_names" required /></FormField>
      <FormField error={state.errors?.last_names?.[0]} label="Apellidos" name="last_names" required><Input defaultValue={participant.last_names} id="last_names" name="last_names" required /></FormField>
      <FormField error={state.errors?.email?.[0]} label="Correo" name="email" required><Input defaultValue={participant.email} id="email" name="email" required type="email" /></FormField>
      <FormField error={state.errors?.phone?.[0]} label="Celular" name="phone" required><Input defaultValue={participant.phone} id="phone" name="phone" required /></FormField>
      <FormField error={state.errors?.job_title?.[0]} label="Cargo" name="job_title" required><Input defaultValue={participant.job_title} id="job_title" name="job_title" required /></FormField>
      <FormField error={state.errors?.company?.[0]} label="Empresa" name="company"><Input defaultValue={participant.company ?? ""} id="company" name="company" /></FormField>
      <FormField error={state.errors?.ruc?.[0]} label="RUC" name="ruc"><Input defaultValue={participant.ruc ?? ""} id="ruc" inputMode="numeric" name="ruc" /></FormField>
      <FormField error={state.errors?.address?.[0]} label="Dirección" name="address"><Input defaultValue={participant.address ?? ""} id="address" name="address" /></FormField>
      <div className="md:col-span-2 flex flex-wrap items-center gap-4">
        <Button disabled={pending} type="submit">{pending ? "Guardando…" : "Guardar correcciones"}</Button>
        {state.message ? <p className={`text-sm font-medium ${state.success ? "text-emerald-700" : "text-rose-700"}`} role={state.success ? "status" : "alert"}>{state.message}</p> : null}
      </div>
    </form>
  );
}
