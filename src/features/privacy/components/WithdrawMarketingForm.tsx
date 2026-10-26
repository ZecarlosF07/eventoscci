"use client";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import { FormField } from "@/components/molecules/FormField";
import { withdrawMarketingConsent } from "@/features/privacy/mutations/marketing-privacy.actions";
import type { PrivacyFormState, WithdrawMarketingFormProps } from "@/features/privacy/types/privacy.types";
import { usePersistentAction } from "@/hooks/use-persistent-action";

const INITIAL_STATE: PrivacyFormState = {};

export function WithdrawMarketingForm({ enabled, personId }: WithdrawMarketingFormProps) {
  const { onSubmit, pending, state } = usePersistentAction(withdrawMarketingConsent.bind(null, personId), INITIAL_STATE);
  if (!enabled && !state.success) return null;
  return <form className="space-y-3" noValidate onSubmit={onSubmit}>
    {!state.success ? <><FormField error={state.errors?.reason?.[0]} label="Motivo de la baja de publicidad" name="reason" required>
      <Input aria-invalid={Boolean(state.errors?.reason)} id="reason" maxLength={500} name="reason" placeholder="Solicitud recibida por correo…" required />
    </FormField><Button disabled={pending} type="submit" variant="secondary">{pending ? "Registrando…" : "Registrar baja de correo y WhatsApp"}</Button></> : null}
    <FormActionNotice message={state.message} success={state.success} />
  </form>;
}
