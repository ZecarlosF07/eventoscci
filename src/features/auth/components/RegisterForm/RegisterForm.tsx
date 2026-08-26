"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import { registerAction } from "@/features/auth/mutations/register.actions";
import type { RegisterActionState, RegisterFormProps, RegisterFormValues } from "@/features/auth/types/auth.types";
import { usePersistentAction } from "@/hooks/use-persistent-action";

const INITIAL_STATE: RegisterActionState = {};
const INITIAL_VALUES: RegisterFormValues = {
  address: "",
  company: "",
  confirm_password: "",
  document_number: "",
  document_type: "dni",
  email: "",
  first_names: "",
  job_title: "",
  last_names: "",
  password: "",
  phone: "",
  ruc: "",
};

export function RegisterForm({ next }: RegisterFormProps) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const { onSubmit, pending, state } = usePersistentAction(registerAction, INITIAL_STATE);
  const error = (name: string) => state.errors?.[name]?.[0];

  function updateValue(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const field = event.target.name as keyof RegisterFormValues;
    setValues((current) => ({ ...current, [field]: event.target.value }));
  }

  return (
    <form className="space-y-7" method="post" onSubmit={onSubmit}>
      <input name="next" type="hidden" value={next ?? ""} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField error={error("document_type")} label="Tipo de documento" name="document_type" required>
          <Select aria-invalid={Boolean(error("document_type"))} id="document_type" name="document_type" onChange={updateValue} value={values.document_type}><option value="dni">DNI</option><option value="ce">Carné de Extranjería</option></Select>
        </FormField>
        <FormField error={error("document_number")} label="Número de documento" name="document_number" required>
          <Input aria-invalid={Boolean(error("document_number"))} autoComplete="off" id="document_number" maxLength={20} name="document_number" onChange={updateValue} required value={values.document_number} />
        </FormField>
        <FormField error={error("first_names")} label="Nombres" name="first_names" required>
          <Input aria-invalid={Boolean(error("first_names"))} autoComplete="given-name" id="first_names" maxLength={120} name="first_names" onChange={updateValue} required value={values.first_names} />
        </FormField>
        <FormField error={error("last_names")} label="Apellidos" name="last_names" required>
          <Input aria-invalid={Boolean(error("last_names"))} autoComplete="family-name" id="last_names" maxLength={120} name="last_names" onChange={updateValue} required value={values.last_names} />
        </FormField>
        <FormField error={error("email")} label="Correo" name="email" required>
          <Input aria-invalid={Boolean(error("email"))} autoComplete="email" id="email" name="email" onChange={updateValue} required type="email" value={values.email} />
        </FormField>
        <FormField error={error("phone")} label="Celular" name="phone" required>
          <Input aria-invalid={Boolean(error("phone"))} autoComplete="tel" id="phone" inputMode="numeric" maxLength={15} name="phone" onChange={updateValue} required value={values.phone} />
        </FormField>
        <FormField error={error("job_title")} label="Cargo" name="job_title" required>
          <Input aria-invalid={Boolean(error("job_title"))} id="job_title" maxLength={160} name="job_title" onChange={updateValue} required value={values.job_title} />
        </FormField>
        <FormField error={error("company")} label="Empresa" name="company">
          <Input autoComplete="organization" id="company" maxLength={180} name="company" onChange={updateValue} value={values.company} />
        </FormField>
        <FormField error={error("ruc")} label="RUC" name="ruc">
          <Input aria-invalid={Boolean(error("ruc"))} id="ruc" inputMode="numeric" maxLength={11} name="ruc" onChange={updateValue} value={values.ruc} />
        </FormField>
        <FormField error={error("address")} label="Dirección" name="address">
          <Input autoComplete="street-address" id="address" maxLength={300} name="address" onChange={updateValue} value={values.address} />
        </FormField>
        <FormField error={error("password")} hint="Mínimo 8 caracteres, con mayúscula, minúscula y número." label="Contraseña" name="password" required>
          <Input aria-invalid={Boolean(error("password"))} autoComplete="new-password" id="password" minLength={8} name="password" onChange={updateValue} required type="password" value={values.password} />
        </FormField>
        <FormField error={error("confirm_password")} label="Confirmar contraseña" name="confirm_password" required>
          <Input aria-invalid={Boolean(error("confirm_password"))} autoComplete="new-password" id="confirm_password" minLength={8} name="confirm_password" onChange={updateValue} required type="password" value={values.confirm_password} />
        </FormField>
      </div>
      <FormActionNotice message={state.message} success={state.success} />
      <Button className="w-full" disabled={pending || state.success} type="submit">{pending ? "Creando cuenta…" : "Crear cuenta"}</Button>
    </form>
  );
}
