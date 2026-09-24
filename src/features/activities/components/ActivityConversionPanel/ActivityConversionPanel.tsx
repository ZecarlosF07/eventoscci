import type { ActivityConversionPanelProps } from "@/features/activities/components/ActivityConversionPanel/types/activity-conversion-panel.types";
import { ActivityCertificateBenefit } from "@/features/activities/components/ActivityCertificateBenefit";
import { getWhatsAppUrl } from "@/features/activities/utils/activity-contact";
import { formatActivityPrice } from "@/features/activities/utils/activity-formatters";
import { hasActivityEnded } from "@/features/activities/utils/activity-lifecycle";
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
  const isFinished = activity.status === "finished" || hasActivityEnded(activity.dates, new Date(initialNow));
  const canCountDown = Boolean(
    availability?.is_open &&
    activity.registration_close_at &&
    new Date(activity.registration_close_at).getTime() > initialNow,
  );
  const isUnavailable = activity.status === "cancelled" || isFinished;
  const panelTitle = activity.status === "cancelled"
    ? "Actividad cancelada"
    : isFinished
      ? "Actividad finalizada"
      : "Participa en esta actividad";

  return (
    <aside aria-label="Inscripción a la actividad" className="rounded-3xl border border-cci-200 bg-white p-5 shadow-xl shadow-cci-950/10 sm:p-6">
      <div className="border-b border-cci-100 pb-4">
        <h2 className="text-2xl font-semibold leading-tight text-cci-950">{panelTitle}</h2>
      </div>
      {!isUnavailable ? (
        <div className="mt-5 rounded-2xl bg-cci-50 p-4">
          {activity.is_free ? (
            <div><p className="text-base text-slate-600">Precio por persona</p><strong className="mt-1 block text-3xl text-cci-950">Gratis</strong></div>
          ) : activity.members_only ? (
            <div><p className="text-base text-slate-600">Tarifa de asociado</p><strong className="mt-1 block text-2xl text-cci-950">{formatActivityPrice(activity.member_price)}</strong></div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-slate-600">Público general</p><strong className="mt-1 block text-xl text-cci-950">{formatActivityPrice(activity.general_price)}</strong></div>
              <div><p className="text-sm text-slate-600">Asociados</p><strong className="mt-1 block text-xl text-cci-950">{formatActivityPrice(activity.member_price)}</strong></div>
            </div>
          )}
        </div>
      ) : <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-base text-slate-700">Ya no se aceptan inscripciones.</p>}
      {!isUnavailable ? <div className="mt-5">{availability ? <RegistrationCta activityId={activity.id} activitySlug={activity.slug} activityType={activity.type} availability={availability} /> : <p className="rounded-xl bg-slate-100 p-4 text-center text-base font-semibold text-slate-600">Disponibilidad no confirmada</p>}</div> : null}
      {availability?.is_open && !activity.is_free ? <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">El personal de CCI confirmará tu inscripción después de validar el pago.</p> : null}
      {whatsAppUrl ? <a className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-cci-700 bg-white px-4 py-2 text-base font-semibold text-cci-950 transition hover:bg-cci-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-800" href={whatsAppUrl} rel="noreferrer" target="_blank"><WhatsAppIcon /> Quiero más información</a> : null}
      {canCountDown && activity.registration_close_at ? (
        <div className="mt-5 rounded-2xl bg-cci-950 p-4"><RegistrationCountdown deadline={activity.registration_close_at} initialNow={initialNow} /></div>
      ) : null}
      {activity.certificate_mode !== "none" ? <div className="mt-5">
        <ActivityCertificateBenefit
          generalPrice={activity.certificate_general_price}
          isActivityFree={activity.is_free}
          memberPrice={activity.certificate_member_price}
          mode={activity.certificate_mode}
        />
      </div> : null}
      <dl className="mt-6 space-y-3 border-t border-cci-100 pt-5 text-base">
        {activity.capacity ? <div className="flex justify-between gap-4"><dt className="text-slate-600">Capacidad</dt><dd className="font-semibold text-cci-950">{activity.capacity} personas</dd></div> : null}
        {activity.venue ? <div><dt className="text-slate-600">Lugar</dt><dd className="mt-1 font-semibold text-cci-950">{activity.venue.name}</dd></div> : null}
        {activity.contact ? <div><dt className="text-slate-600">Contacto</dt><dd className="mt-1 font-semibold text-cci-950">{activity.contact.contact_name}</dd></div> : null}
      </dl>
    </aside>
  );
}
