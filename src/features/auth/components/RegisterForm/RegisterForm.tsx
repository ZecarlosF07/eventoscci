"use client";

import { useActionState } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import { registerAction } from "@/features/auth/mutations/register.actions";
import type { RegisterActionState, RegisterFormProps } from "@/features/auth/types/auth.types";

const INITIAL_STATE: RegisterActionState = {};

export function RegisterForm({ next }: RegisterFormProps) {
  const [state, action, pending] = useActionState(registerAction, INITIAL_STATE);
  const error = (name: string) => state.errors?.[name]?.[0];

  return (
    <form action={action} className="space-y-7">
      <input name="next" type="hidden" value={next ?? ""} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField error={error("document_type")} label="Tipo de documento" name="document_type" required>
          <Select defaultValue="dni" id="document_type" name="document_type"><option value="dni">DNI</option><option value="ce">Carné de Extranjería</option></Select>
        </FormField>
        <FormField error={error("document_number")} label="Número de documento" name="document_number" required>
          <Input autoComplete="off" id="document_number" maxLength={20} name="document_number" required />
        </FormField>
        <FormField error={error("first_names")} label="Nombres" name="first_names" required>
          <Input autoComplete="given-name" id="first_names" maxLength={120} name="first_names" required />
        </FormField>
        <FormField error={error("last_names")} label="Apellidos" name="last_names" required>
          <Input autoComplete="family-name" id="last_names" maxLength={120} name="last_names" required />
        </FormField>
        <FormField error={error("email")} label="Correo" name="email" required>
          <Input autoComplete="email" id="email" name="email" required type="email" />
        </FormField>
        <FormField error={error("phone")} label="Celular" name="phone" required>
          <Input autoComplete="tel" id="phone" inputMode="numeric" maxLength={15} name="phone" required />
        </FormField>
        <FormField error={error("job_title")} label="Cargo" name="job_title" required>
          <Input id="job_title" maxLength={160} name="job_title" required />
        </FormField>
        <FormField error={error("company")} label="Empresa" name="company">
          <Input autoComplete="organization" id="company" maxLength={180} name="company" />
        </FormField>
        <FormField error={error("ruc")} label="RUC" name="ruc">
          <Input id="ruc" inputMode="numeric" maxLength={11} name="ruc" />
        </FormField>
        <FormField error={error("address")} label="Dirección" name="address">
          <Input autoComplete="street-address" id="address" maxLength={300} name="address" />
        </FormField>
        <FormField error={error("password")} hint="Mínimo 8 caracteres, con mayúscula, minúscula y número." label="Contraseña" name="password" required>
          <Input autoComplete="new-password" id="password" minLength={8} name="password" required type="password" />
        </FormField>
        <FormField error={error("confirm_password")} label="Confirmar contraseña" name="confirm_password" required>
          <Input autoComplete="new-password" id="confirm_password" minLength={8} name="confirm_password" required type="password" />
        </FormField>
      </div>
      {state.message ? <p className={`rounded-xl p-4 text-sm font-medium ${state.success ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`} role="status">{state.message}</p> : null}
      <Button className="w-full" disabled={pending || state.success} type="submit">{pending ? "Creando cuenta…" : "Crear cuenta"}</Button>
    </form>
  );
}
