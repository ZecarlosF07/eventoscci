import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { RegistrationPageTemplateProps } from "@/components/templates/RegistrationPageTemplate/types/registration-page-template.types";
import { ActivityCertificateBenefit } from "@/features/activities/components/ActivityCertificateBenefit";
import { getPublicActivityRoute } from "@/features/activities/utils/activity-routes";
import { ActivityPricingProvider } from "@/features/activities/components/ActivityPricingProvider/ActivityPricingProvider";
import { RegistrationParticipationPrices } from "@/features/activities/components/ActivityParticipationPrices/RegistrationParticipationPrices";
import { RegistrationForm } from "@/features/registrations/components/RegistrationForm";
import { PaymentInstructions } from "@/features/registrations/components/PaymentInstructions";
import { MemberGroupRegistrationForm } from "@/features/member-groups/components/MemberGroupRegistrationForm/MemberGroupRegistrationForm";
import { REGISTRATION_AVAILABILITY_LABELS } from "@/features/registrations/constants/registration.constants";
import { getRegistrationProcessMessage } from "@/features/registrations/utils/registration-summary-copy";

export function RegistrationPageTemplate({
  activity,
  availability,
  initialNow,
}: RegistrationPageTemplateProps) {
  const detailRoute = getPublicActivityRoute(activity.type, activity.slug);
  const isExclusiveMemberEvent = activity.type === "event" && activity.membersOnly;

  return (
    <ActivityPricingProvider initialNow={initialNow} pricing={activity}><section className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-12 lg:px-8">
      <Link className="text-sm font-bold text-cci-700 hover:text-cci-950" href={detailRoute}>
        ← Volver a la actividad
      </Link>
      <div className="mt-7 grid gap-8 lg:grid-cols-[0.7fr_0.3fr] lg:items-start">
        <div className="rounded-2xl border border-cci-100 bg-white p-5 shadow-lg shadow-cci-950/5 sm:rounded-3xl sm:p-8">
          <Badge>{activity.isFree ? "Inscripción gratuita" : isExclusiveMemberEvent ? "Solicitud grupal para asociados" : "Preinscripción"}</Badge>
          <Heading className="mt-4" level={1}>Inscripción</Heading>
          <Text className="mt-3" size="lg">{activity.title}</Text>
          <div className="mt-7 border-t border-cci-100 pt-7">
            {availability.is_open ? (
              isExclusiveMemberEvent
                ? <MemberGroupRegistrationForm activity={activity} />
                : <RegistrationForm activity={activity} />
            ) : (
              <div className="rounded-2xl bg-cci-100 p-6 text-center">
                <Heading level={3}>{REGISTRATION_AVAILABILITY_LABELS[availability.reason]}</Heading>
                <Text className="mt-2">Esta actividad no puede recibir nuevas inscripciones en este momento.</Text>
              </div>
            )}
          </div>
        </div>
        <aside className="space-y-4 rounded-3xl border border-cci-100 bg-cci-100 p-6 lg:sticky lg:top-24">
          <Heading level={3}>Tu participación</Heading>
          <RegistrationParticipationPrices membersOnly={activity.membersOnly} />
          {!activity.isFree && activity.paymentNote ? <PaymentInstructions note={activity.paymentNote} /> : null}
          <ActivityCertificateBenefit
            generalPrice={activity.certificateGeneralPrice}
            isActivityFree={activity.isFree}
            memberPrice={activity.certificateMemberPrice}
            membersOnly={activity.membersOnly}
            mode={activity.certificateMode}
          />
          <Text size="sm">{getRegistrationProcessMessage(activity.isFree, isExclusiveMemberEvent)}</Text>
          <Text size="sm">Puedes inscribirte sin crear una cuenta.</Text>
        </aside>
      </div>
    </section></ActivityPricingProvider>
  );
}
