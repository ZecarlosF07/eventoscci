"use client";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import { requestPasswordResetAction } from "@/features/auth/mutations/password.actions";
import type { PasswordActionState } from "@/features/auth/types/auth.types";
import { usePersistentAction } from "@/hooks/use-persistent-action";

const INITIAL_STATE: PasswordActionState = {};

export function ForgotPasswordForm() {
  const { onSubmit, pending, state } = usePersistentAction(requestPasswordResetAction, INITIAL_STATE);
  return <form className="space-y-5" method="post" onSubmit={onSubmit}>
    <FormField error={state.errors?.email?.[0]} label="Correo de acceso" name="email" required>
      <Input autoComplete="email" id="email" name="email" required type="email" />
    </FormField>
    <FormActionNotice message={state.message} success={state.success} />
    <Button className="w-full" disabled={pending} type="submit">{pending ? "Enviando…" : "Enviar enlace"}</Button>
  </form>;
}
