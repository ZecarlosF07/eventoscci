import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { ActivityConversionPanelProps } from "@/features/activities/components/ActivityConversionPanel/types/activity-conversion-panel.types";
import { getWhatsAppUrl } from "@/features/activities/utils/activity-contact";
import { formatActivityPrice } from "@/features/activities/utils/activity-formatters";
import { RegistrationCountdown } from "@/features/registrations/components/RegistrationCountdown";
import { RegistrationCta } from "@/features/registrations/components/RegistrationCta";

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path d="M20 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.2A8 8 0 1 1 20 11.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M9.2 8.4c.2-.4.4-.4.7-.4h.4c.2 0 .4.1.5.4l.7 1.6c.1.2.1.4-.1.6l-.6.7c-.2.2-.1.4 0 .6.7 1.2 1.7 2.1 2.9 2.7.2.1.4.1.6-.1l.8-1c.2-.2.4-.3.6-.2l1.7.8c.3.1.4.3.4.5 0 .3-.1 1.3-.8 1.9-.6.5-1.4.8-2.3.6-1.1-.2-2.5-.7-4.2-2.2-1.4-1.3-2.4-2.8-2.7-3.9-.4-1.3 0-2 .4-2.6Z" fill="currentColor" />
    </svg>
  );
}

export function ActivityConversionPanel({
  activity,
  availability,
  initialNow,
}: ActivityConversionPanelProps) {
  const whatsAppUrl = getWhatsAppUrl(activity.contact?.whatsapp_phone ?? null, activity.title);
  const canCountDown = Boolean(
    availability?.is_open &&
    activity.registration_close_at &&
    new Date(activity.registration_close_at).getTime() > initialNow,
  );

  return (
    <aside className="rounded-3xl border border-cci-200 bg-white p-5 shadow-xl shadow-cci-950/10 sm:p-6 lg:sticky lg:top-24">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-700">Reserva tu lugar</p>
      <Heading className="mt-2" level={3}>{activity.is_free ? "Participación gratuita" : "Inscríbete en esta actividad"}</Heading>
      <div className="mt-5 rounded-2xl bg-cci-50 p-4">
        {activity.is_free ? <strong className="text-2xl text-cci-950">Gratis</strong> : (
          <div className="grid grid-cols-2 gap-4">
            <div><Text size="sm">Precio general</Text><strong className="mt-1 block text-lg text-cci-950">{formatActivityPrice(activity.general_price)}</strong></div>
            <div><Text size="sm">Asociados</Text><strong className="mt-1 block text-lg text-cci-950">{formatActivityPrice(activity.member_price)}</strong></div>
          </div>
        )}
      </div>
      {canCountDown && activity.registration_close_at ? (
        <div className="mt-4 rounded-2xl bg-cci-950 p-4"><RegistrationCountdown deadline={activity.registration_close_at} initialNow={initialNow} /></div>
      ) : null}
      <div className="mt-5">{availability ? <RegistrationCta activitySlug={activity.slug} activityType={activity.type} availability={availability} /> : <p className="rounded-xl bg-slate-100 p-3 text-center text-sm font-semibold text-slate-600">Disponibilidad no confirmada</p>}</div>
      {whatsAppUrl ? <a className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-cci-300 bg-white px-4 py-2 text-sm font-semibold text-cci-950 transition hover:border-cci-600 hover:bg-cci-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-800" href={whatsAppUrl} rel="noreferrer" target="_blank"><WhatsAppIcon /> Quiero más información</a> : null}
      <dl className="mt-6 space-y-3 border-t border-cci-100 pt-5 text-sm">
        {activity.capacity ? <div className="flex justify-between gap-4"><dt className="text-slate-500">Capacidad</dt><dd className="font-semibold text-cci-950">{activity.capacity} personas</dd></div> : null}
        {activity.venue ? <div><dt className="text-slate-500">Lugar</dt><dd className="mt-1 font-semibold text-cci-950">{activity.venue.name}</dd></div> : null}
        {activity.contact ? <div><dt className="text-slate-500">Contacto</dt><dd className="mt-1 font-semibold text-cci-950">{activity.contact.contact_name}</dd></div> : null}
      </dl>
    </aside>
  );
}
