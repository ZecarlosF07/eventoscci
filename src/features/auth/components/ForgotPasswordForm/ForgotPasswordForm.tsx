"use client";

import { useActionState } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { requestPasswordResetAction } from "@/features/auth/mutations/password.actions";
import type { PasswordActionState } from "@/features/auth/types/auth.types";

const INITIAL_STATE: PasswordActionState = {};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, INITIAL_STATE);
  return <form action={action} className="space-y-5">
    <FormField error={state.errors?.email?.[0]} label="Correo de acceso" name="email" required>
      <Input autoComplete="email" id="email" name="email" required type="email" />
    </FormField>
    {state.message ? <p className={`rounded-xl p-4 text-sm font-medium ${state.success ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`} role="status">{state.message}</p> : null}
    <Button className="w-full" disabled={pending} type="submit">{pending ? "Enviando…" : "Enviar enlace"}</Button>
  </form>;
}
