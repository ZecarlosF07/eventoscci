import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { RegistrationPageTemplateProps } from "@/components/templates/RegistrationPageTemplate/types/registration-page-template.types";
import { PriceDisplay } from "@/components/molecules/PriceDisplay";
import { getPublicActivityRoute } from "@/features/activities/utils/activity-routes";
import { RegistrationForm } from "@/features/registrations/components/RegistrationForm";
import { REGISTRATION_AVAILABILITY_LABELS } from "@/features/registrations/constants/registration.constants";

export function RegistrationPageTemplate({
  activity,
  availability,
}: RegistrationPageTemplateProps) {
  const detailRoute = getPublicActivityRoute(activity.type, activity.slug);

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <Link className="text-sm font-bold text-cci-700 hover:text-cci-950" href={detailRoute}>
        ← Volver a la actividad
      </Link>
      <div className="mt-7 grid gap-8 lg:grid-cols-[0.7fr_0.3fr] lg:items-start">
        <div className="rounded-3xl border border-cci-100 bg-white p-6 shadow-lg shadow-cci-950/5 sm:p-8">
          <Badge>{activity.isFree ? "Inscripción gratuita" : "Preinscripción"}</Badge>
          <Heading className="mt-4" level={1}>Inscripción</Heading>
          <Text className="mt-3" size="lg">{activity.title}</Text>
          <div className="mt-7 border-t border-cci-100 pt-7">
            {availability.is_open ? (
              <RegistrationForm activity={activity} />
            ) : (
              <div className="rounded-2xl bg-cci-100 p-6 text-center">
                <Heading level={3}>{REGISTRATION_AVAILABILITY_LABELS[availability.reason]}</Heading>
                <Text className="mt-2">Esta actividad no puede recibir nuevas inscripciones en este momento.</Text>
              </div>
            )}
          </div>
        </div>
        <aside className="space-y-4 rounded-3xl border border-cci-100 bg-cci-100 p-6 lg:sticky lg:top-24">
          <Heading level={3}>Resumen</Heading>
          <PriceDisplay
            generalPrice={activity.generalPrice}
            isFree={activity.isFree}
            memberPrice={activity.memberPrice}
          />
          <Text size="sm">No necesitas crear una cuenta para completar este proceso.</Text>
          {!activity.isFree ? (
            <Text size="sm">La preinscripción requiere confirmación posterior de la Cámara.</Text>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
