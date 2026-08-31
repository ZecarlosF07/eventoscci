"use client";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { loginAction } from "@/features/auth/mutations/auth.actions";
import type { LoginActionState, LoginFormProps } from "@/features/auth/types/auth.types";
import { usePersistentAction } from "@/hooks/use-persistent-action";

const INITIAL_STATE: LoginActionState = {};

export function LoginForm({ next, portal = "public" }: LoginFormProps) {
  const { onSubmit, pending, state } = usePersistentAction(loginAction, INITIAL_STATE);

  return (
    <form className="space-y-5" method="post" onSubmit={onSubmit}>
      <input name="next" type="hidden" value={next ?? ""} />
      <input name="portal" type="hidden" value={portal} />
      <FormField
        error={state.errors?.email?.[0]}
        label="Correo"
        name="email"
        required
      >
        <Input autoComplete="email" id="email" name="email" required type="email" />
      </FormField>
      <FormField
        error={state.errors?.password?.[0]}
        label="Contraseña"
        name="password"
        required
      >
        <Input
          autoComplete="current-password"
          id="password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </FormField>
      {state.message ? (
        <p className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
          {state.message}
        </p>
      ) : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Verificando…" : portal === "public" ? "Ingresar al Campus" : "Ingresar"}
      </Button>
    </form>
  );
}
