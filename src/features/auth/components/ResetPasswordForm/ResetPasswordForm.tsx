"use client";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { updatePasswordAction } from "@/features/auth/mutations/password.actions";
import type { PasswordActionState } from "@/features/auth/types/auth.types";
import { usePersistentAction } from "@/hooks/use-persistent-action";

const INITIAL_STATE: PasswordActionState = {};

export function ResetPasswordForm() {
  const { onSubmit, pending, state } = usePersistentAction(updatePasswordAction, INITIAL_STATE);
  return <form className="space-y-5" method="post" onSubmit={onSubmit}>
    <FormField error={state.errors?.password?.[0]} hint="Mínimo 8 caracteres, con mayúscula, minúscula y número." label="Nueva contraseña" name="password" required>
      <Input autoComplete="new-password" id="password" minLength={8} name="password" required type="password" />
    </FormField>
    <FormField error={state.errors?.confirm_password?.[0]} label="Confirmar contraseña" name="confirm_password" required>
      <Input autoComplete="new-password" id="confirm_password" minLength={8} name="confirm_password" required type="password" />
    </FormField>
    {state.message ? <p className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-800" role="alert">{state.message}</p> : null}
    <Button className="w-full" disabled={pending} type="submit">{pending ? "Actualizando…" : "Guardar contraseña"}</Button>
  </form>;
}
