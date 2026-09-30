"use client";

import { useState, type FormEvent } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { Text } from "@/components/atoms/Text";
import { IndividualBillingFields } from "@/features/billing/components/IndividualBillingFields";
import type { BillingInput } from "@/features/billing/types/billing.types";
import { applicableBilling } from "@/features/billing/utils/billing-input";
import { CertificateInterestField } from "@/features/registrations/components/CertificateInterestField";
import { FutureTopicsField } from "@/features/registrations/components/FutureTopicsField";
import { ProfessionalRegistrationFields } from "@/features/registrations/components/ProfessionalRegistrationFields";
import { RegistrationContactFields } from "@/features/registrations/components/RegistrationContactFields";
import { RegistrationIdentityFields } from "@/features/registrations/components/RegistrationIdentityFields";
import { RegistrationProfileSelector } from "@/features/registrations/components/RegistrationProfileSelector";
import { RegistrationTypeSelector } from "@/features/registrations/components/RegistrationTypeSelector";
import { StudentRegistrationFields } from "@/features/registrations/components/StudentRegistrationFields";
import { trackAnalyticsEvent } from "@/features/analytics/services/track-analytics-event.client";
import { registerActivity } from "@/features/registrations/mutations/register-activity";
import type {
  RegistrationFormProps,
  ParticipantProfile,
  RegistrationType,
} from "@/features/registrations/types/registration.types";
import { focusFirstInvalidField } from "@/features/registrations/utils/focus-first-invalid-field";
import { parseRegistrationFormData } from "@/features/registrations/utils/registration-form-data";
import { getRegistrationResultRoute } from "@/features/registrations/utils/registration-routes";
import { validateRegistrationWithBilling } from "@/features/registrations/utils/registration-billing-validation";

export function RegistrationForm({ activity }: RegistrationFormProps) {
  const router = useRouter();
  const [registrationType, setRegistrationType] = useState<RegistrationType>(
    activity.membersOnly ? "member" : "general",
  );
  const [generalProfile, setGeneralProfile] = useState<ParticipantProfile>("professional");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string>();
  const [isPending, setIsPending] = useState(false);
  const [billing, setBilling] = useState<BillingInput>({ type: "boleta", document: "", name: "" });
  const requiresBilling = !activity.isFree && (registrationType === "member" ? activity.memberPrice : activity.generalPrice) > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    const form = event.currentTarget;

    setErrors({});
    setMessage(undefined);
    setIsPending(true);
    const participantProfile = registrationType === "member" ? "professional" : generalProfile;
    trackAnalyticsEvent("registration_started", {
      activity_id: activity.id,
      activity_type: activity.type,
      is_free: activity.isFree,
      participant_profile: participantProfile,
      registration_type: registrationType,
    });

    try {
      const input = { ...parseRegistrationFormData(new FormData(form)), billing: requiresBilling ? applicableBilling(billing) : null };
      const validated = validateRegistrationWithBilling(input, requiresBilling ? 1 : 0);
      if (!validated.success) {
        setErrors(Object.fromEntries(validated.error.issues.map((issue) => [issue.path.join("."), [issue.message]])));
        setMessage("Revisa los campos indicados antes de continuar.");
        focusFirstInvalidField(form);
        return;
      }
      const result = await registerActivity(activity.id, input);
      if (!result.success) {
        setErrors(result.fieldErrors ?? {});
        setMessage(result.message);
        focusFirstInvalidField(form);
        return;
      }

      trackAnalyticsEvent("registration_completed", {
        activity_id: activity.id,
        activity_type: activity.type,
        is_free: activity.isFree,
        participant_profile: participantProfile,
        registration_type: registrationType,
      });

      router.push(
        getRegistrationResultRoute(
          activity.type,
          activity.slug,
          result.data.registration_code,
          result.data.certificate_request_token,
        ),
      );
    } catch {
      setMessage("Ocurrió un problema inesperado. Inténtalo nuevamente.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="space-y-7" noValidate onSubmit={handleSubmit}>
      <RegistrationTypeSelector
        membersOnly={activity.membersOnly}
        onChange={setRegistrationType}
        value={registrationType}
      />
      {registrationType === "general" ? (
        <RegistrationProfileSelector onChange={setGeneralProfile} value={generalProfile} />
      ) : null}
      <RegistrationIdentityFields errors={errors} />
      <RegistrationContactFields errors={errors} />
      <ProfessionalRegistrationFields
        active={registrationType === "member" || generalProfile === "professional"}
        errors={errors}
      />
      <StudentRegistrationFields
        active={registrationType === "general" && generalProfile === "student"}
        errors={errors}
      />
      {requiresBilling ? <IndividualBillingFields allowCompanyCopy={registrationType === "member" || generalProfile === "professional"} billing={billing} onChange={setBilling} errors={Object.fromEntries(Object.entries(errors).filter(([key]) => key.startsWith("billing.")).map(([key, value]) => [key.slice(8), value[0]]))} /> : null}
      {activity.certificateMode === "optional_paid" ? (
        <CertificateInterestField
          generalPrice={activity.certificateGeneralPrice}
          memberPrice={activity.certificateMemberPrice}
          registrationType={registrationType}
        />
      ) : null}
      <FutureTopicsField error={errors.future_topics_suggestion?.[0]} />
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
