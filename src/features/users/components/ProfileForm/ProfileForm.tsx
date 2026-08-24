"use client";

import { useActionState } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { updateProfileAction } from "@/features/users/mutations/profile.actions";
import type { ProfileActionState, ProfileFormProps } from "@/features/users/types/user-profile.types";

const INITIAL_STATE: ProfileActionState = {};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfileAction, INITIAL_STATE);
  const error = (name: string) => state.errors?.[name]?.[0];
  return <form action={action} className="space-y-6 rounded-3xl border border-cci-100 bg-white p-6 sm:p-8">
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField label="Documento" name="document" hint="La identidad documental solo puede corregirse mediante la Cámara."><Input disabled id="document" value={`${profile.document_type.toUpperCase()} ${profile.document_number}`} /></FormField>
      <FormField label="Correo de acceso" name="email" hint="El correo de autenticación se gestiona de forma controlada."><Input disabled id="email" value={profile.email} /></FormField>
      <FormField error={error("first_names")} label="Nombres" name="first_names" required><Input defaultValue={profile.first_names} id="first_names" maxLength={120} name="first_names" required /></FormField>
      <FormField error={error("last_names")} label="Apellidos" name="last_names" required><Input defaultValue={profile.last_names} id="last_names" maxLength={120} name="last_names" required /></FormField>
      <FormField error={error("phone")} label="Celular" name="phone" required><Input defaultValue={profile.phone} id="phone" maxLength={15} name="phone" required /></FormField>
      <FormField error={error("job_title")} label="Cargo" name="job_title" required><Input defaultValue={profile.job_title} id="job_title" maxLength={160} name="job_title" required /></FormField>
      <FormField error={error("company")} label="Empresa" name="company"><Input defaultValue={profile.company ?? ""} id="company" maxLength={180} name="company" /></FormField>
      <FormField error={error("ruc")} label="RUC" name="ruc"><Input defaultValue={profile.ruc ?? ""} id="ruc" inputMode="numeric" maxLength={11} name="ruc" /></FormField>
      <div className="sm:col-span-2"><FormField error={error("address")} label="Dirección" name="address"><Input defaultValue={profile.address ?? ""} id="address" maxLength={300} name="address" /></FormField></div>
    </div>
    {state.message ? <p className={`rounded-xl p-4 text-sm font-medium ${state.success ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`} role="status">{state.message}</p> : null}
    <Button disabled={pending} type="submit">{pending ? "Guardando…" : "Guardar cambios"}</Button>
  </form>;
}
