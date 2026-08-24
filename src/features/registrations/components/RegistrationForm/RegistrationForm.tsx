"use client";

import { useState, type FormEvent } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { Text } from "@/components/atoms/Text";
import { RegistrationContactFields } from "@/features/registrations/components/RegistrationContactFields";
import { RegistrationIdentityFields } from "@/features/registrations/components/RegistrationIdentityFields";
import { RegistrationTypeSelector } from "@/features/registrations/components/RegistrationTypeSelector";
import { registerActivity } from "@/features/registrations/mutations/register-activity";
import type {
  RegistrationFormProps,
  RegistrationType,
} from "@/features/registrations/types/registration.types";
import { parseRegistrationFormData } from "@/features/registrations/utils/registration-form-data";
import { getRegistrationResultRoute } from "@/features/registrations/utils/registration-routes";

export function RegistrationForm({ activity }: RegistrationFormProps) {
  const router = useRouter();
  const [registrationType, setRegistrationType] = useState<RegistrationType>(
    activity.membersOnly ? "member" : "general",
  );
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    setErrors({});
    setMessage(undefined);
    setIsPending(true);

    try {
      const input = parseRegistrationFormData(new FormData(event.currentTarget));
      const result = await registerActivity(activity.id, input);
      if (!result.success) {
        setErrors(result.fieldErrors ?? {});
        setMessage(result.message);
        return;
      }

      router.push(
        getRegistrationResultRoute(
          activity.type,
          activity.slug,
          result.data.registration_code,
        ),
      );
    } catch {
      setMessage("Ocurrió un problema inesperado. Inténtalo nuevamente.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="space-y-7" onSubmit={handleSubmit}>
      <RegistrationTypeSelector
        membersOnly={activity.membersOnly}
        onChange={setRegistrationType}
        value={registrationType}
      />
      <RegistrationIdentityFields errors={errors} />
      <RegistrationContactFields
        errors={errors}
        isMember={registrationType === "member"}
      />
      {message ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800" role="alert">
          {message}
        </div>
      ) : null}
      <div className="border-t border-cci-100 pt-5">
        <Button className="w-full sm:w-auto" disabled={isPending} type="submit">
          {isPending ? <><Spinner className="mr-2" /> Procesando inscripción…</> : activity.isFree ? "Confirmar inscripción" : "Registrar preinscripción"}
        </Button>
        <Text className="mt-3" size="sm">
          Al enviar confirmas que los datos ingresados son correctos.
        </Text>
      </div>
    </form>
  );
}
