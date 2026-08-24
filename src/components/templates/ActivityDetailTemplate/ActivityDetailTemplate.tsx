import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { PriceDisplay } from "@/components/molecules/PriceDisplay";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import type { ActivityDetailTemplateProps } from "@/components/templates/ActivityDetailTemplate/types/activity-detail-template.types";
import { ActivityInformation } from "@/features/activities/components/ActivityInformation";
import { ActivitySchedule } from "@/features/activities/components/ActivitySchedule";
import { ActivitySpeakers } from "@/features/activities/components/ActivitySpeakers";
import { ACTIVITY_TYPE_LABELS } from "@/features/activities/constants/activity.constants";
import { getActivityBannerUrl, getModalityLabel } from "@/features/activities/utils/activity-formatters";
import { getPublicActivityRoute } from "@/features/activities/utils/activity-routes";
import { RegistrationCta } from "@/features/registrations/components/RegistrationCta";
import { getRegistrationAvailability } from "@/features/registrations/queries/get-registration-availability";

export async function ActivityDetailTemplate({ activity }: ActivityDetailTemplateProps) {
  const bannerUrl = getActivityBannerUrl(activity.banner_path);
  const availability = await getRegistrationAvailability(activity.id);
  return (
    <article className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <Link className="text-sm font-bold text-cci-700 hover:text-cci-950" href={getPublicActivityRoute(activity.type)}>← Volver al catálogo</Link>
      <header className="mt-6 grid gap-8 overflow-hidden rounded-[2rem] bg-cci-950 px-6 py-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start lg:px-10 lg:py-10">
        <div>
          <div className="flex flex-wrap gap-2"><Badge>{ACTIVITY_TYPE_LABELS[activity.type]}</Badge><Badge>{getModalityLabel(activity.modality)}</Badge>{activity.members_only ? <Badge variant="warning">Exclusiva para asociados</Badge> : null}{activity.status === "cancelled" ? <StatusBadge status="cancelled" /> : null}</div>
          <Heading className="mt-5 text-white" level={1}>{activity.title}</Heading>
          {activity.short_description ? <Text className="mt-4 text-white/70" size="lg">{activity.short_description}</Text> : null}
        </div>
        <aside className="space-y-4 rounded-3xl border border-white/10 bg-white p-6 shadow-lg">
          <PriceDisplay generalPrice={activity.general_price} isFree={activity.is_free} memberPrice={activity.member_price} />
          {activity.category ? <Text size="sm"><strong>Tema:</strong> {activity.category.name}</Text> : null}
          {activity.duration_text ? <Text size="sm"><strong>Duración:</strong> {activity.duration_text}</Text> : null}
          {activity.academic_hours !== null ? <Text size="sm"><strong>Horas académicas:</strong> {activity.academic_hours}</Text> : null}
          {activity.capacity ? <Text size="sm"><strong>Capacidad:</strong> {activity.capacity} personas</Text> : <Text size="sm"><strong>Capacidad:</strong> sin límite</Text>}
        </aside>
      </header>
      {bannerUrl ? <div className="relative mt-8 aspect-[16/7] overflow-hidden rounded-3xl bg-cci-100"><Image alt={`Banner de ${activity.title}`} className="object-cover" fill preload sizes="(min-width: 1280px) 1216px, 100vw" src={bannerUrl} /></div> : null}
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_0.4fr]">
        <div className="space-y-10"><ActivityInformation activity={activity} /><ActivitySchedule dates={activity.dates} /><ActivitySpeakers speakers={activity.speakers} /></div>
        <aside className="space-y-5 rounded-3xl border border-cci-100 bg-cci-100 p-6 lg:sticky lg:top-24">
          <Heading level={3}>Información práctica</Heading>
          {activity.location_name ? <Text size="sm"><strong>Lugar:</strong> {activity.location_name}</Text> : null}
          {activity.address ? <Text size="sm"><strong>Dirección:</strong> {activity.address}</Text> : null}
          {activity.virtual_url ? <Text size="sm"><strong>Acceso virtual:</strong> se compartirá según las condiciones de la actividad.</Text> : null}
          {activity.registration_open_at ? <Text size="sm"><strong>Inscripciones:</strong> periodo configurado por la organización.</Text> : null}
          {activity.registrations_closed_manually ? <Badge variant="warning">Inscripciones cerradas</Badge> : null}
          {activity.contact_name ? <Text size="sm"><strong>Contacto:</strong> {activity.contact_name}</Text> : null}
          {activity.contact_phone ? <Text size="sm">{activity.contact_phone}</Text> : null}
          {activity.contact_email ? <Text size="sm">{activity.contact_email}</Text> : null}
          {availability ? (
            <RegistrationCta activitySlug={activity.slug} activityType={activity.type} availability={availability} />
          ) : null}
        </aside>
      </div>
    </article>
  );
}
