"use client";

import { useState, type FormEvent } from "react";

import { useRouter } from "next/navigation";

import { useRegistrationPricing } from "@/features/activities/components/ActivityPricingProvider/ActivityPricingProvider";
import { getActivityPrice } from "@/features/activities/utils/activity-pricing";
import { formatActivityPrice } from "@/features/activities/utils/activity-formatters";
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
import { PROFESSIONAL_ACTIVITY_NOTICE } from "@/features/registrations/constants/registration.constants";
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
  const { now, pricing, refreshPricing } = useRegistrationPricing();
  const [registrationType, setRegistrationType] = useState<RegistrationType>(
    activity.membersOnly ? "member" : "general",
  );
  const [generalProfile, setGeneralProfile] = useState<ParticipantProfile>("professional");
  const activeProfile = registrationType === "member" || !activity.allowsStudentRegistration ? "professional" : generalProfile;
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string>();
  const [isPending, setIsPending] = useState(false);
  const [billing, setBilling] = useState<BillingInput>({ type: "boleta", document: "", name: "" });
  const quote = getActivityPrice(pricing, registrationType, now);
  const requiresBilling = quote.amount > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    const form = event.currentTarget;

    setErrors({});
    setMessage(undefined);
    setIsPending(true);
    const participantProfile = activeProfile;
    trackAnalyticsEvent("registration_started", {
      activity_id: activity.id,
      activity_type: activity.type,
      is_free: activity.isFree,
      participant_profile: participantProfile,
      registration_type: registrationType,
    });

    try {
      const input = { ...parseRegistrationFormData(new FormData(form)), expected_unit_price: quote.amount, billing: requiresBilling ? applicableBilling(billing) : null };
      const validated = validateRegistrationWithBilling(input, requiresBilling ? 1 : 0);
      if (!validated.success) {
        setErrors(Object.fromEntries(validated.error.issues.map((issue) => [issue.path.join("."), [issue.message]])));
        setMessage("Revisa los campos indicados antes de continuar.");
        focusFirstInvalidField(form);
        return;
      }
      const result = await registerActivity(activity.id, input);
      if (!result.success) {
        if (result.pricing) refreshPricing(result.pricing);
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
      {!activity.membersOnly && !activity.allowsStudentRegistration ? <Text className="font-semibold" size="sm">{PROFESSIONAL_ACTIVITY_NOTICE}</Text> : null}
      <RegistrationTypeSelector
        membersOnly={activity.membersOnly}
        onChange={setRegistrationType}
        value={registrationType}
      />
      {registrationType === "general" ? (
        <RegistrationProfileSelector allowsStudentRegistration={activity.allowsStudentRegistration} onChange={setGeneralProfile} value={activeProfile} />
      ) : null}
      <RegistrationIdentityFields errors={errors} />
      <RegistrationContactFields errors={errors} />
      <ProfessionalRegistrationFields
        active={activeProfile === "professional"}
        errors={errors}
      />
      {activity.allowsStudentRegistration && !activity.membersOnly ? <StudentRegistrationFields
        active={activeProfile === "student"}
        errors={errors}
      /> : null}
      {requiresBilling ? <IndividualBillingFields allowCompanyCopy={activeProfile === "professional"} billing={billing} onChange={setBilling} errors={Object.fromEntries(Object.entries(errors).filter(([key]) => key.startsWith("billing.")).map(([key, value]) => [key.slice(8), value[0]]))} /> : null}
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
        <p className="mb-4 text-lg font-semibold text-cci-950" aria-live="polite">Importe de inscripción: {formatActivityPrice(quote.amount)}{quote.isPresale ? " · Preventa" : ""}</p>
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
