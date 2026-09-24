import Link from "next/link";

import { normalizeWhatsAppPhone } from "@/features/activities/utils/activity-contact";
import type { MemberGroupResult as MemberGroupResultData } from "@/features/member-groups/types/member-group.types";

export function MemberGroupResult({ result }: { result: MemberGroupResultData }) {
  const phone = normalizeWhatsAppPhone(result.contact_whatsapp_phone);
  const message = `Hola, solicité plazas para “${result.activity_title}”. Mi código es ${result.request_code} y el importe pendiente es S/ ${result.pending_amount.toFixed(2)}. Quisiera coordinar el pago.`;
  const whatsappUrl = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : null;
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:py-16">
      <div className="rounded-3xl border border-cci-100 bg-white p-6 shadow-lg shadow-cci-950/5 sm:p-9">
        <p className="text-sm font-bold uppercase tracking-widest text-cci-700">Solicitud {result.request_code}</p>
        <h1 className="mt-3 text-3xl font-bold text-cci-950">{result.is_free ? "Plazas confirmadas" : "Solicitud recibida"}</h1>
        <p className="mt-3 text-slate-700">{result.is_free ? "Cada asistente tiene su plaza confirmada." : "Las plazas están reservadas. El personal de la CCI validará el pago y confirmará las plazas correspondientes."}</p>
        <div className="mt-6 rounded-2xl bg-cci-50 p-5">
          <p className="font-bold text-cci-950">{result.activity_title}</p>
          <p className="mt-1 text-sm text-slate-700">{result.company_name} · RUC {result.company_ruc}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div><dt>Total solicitado</dt><dd className="text-lg font-bold">S/ {result.total.toFixed(2)}</dd></div>
            <div><dt>Confirmado</dt><dd className="text-lg font-bold">S/ {result.confirmed_amount.toFixed(2)}</dd></div>
            <div><dt>Pendiente</dt><dd className="text-lg font-bold">S/ {result.pending_amount.toFixed(2)}</dd></div>
          </dl>
        </div>
        <h2 className="mt-7 text-xl font-bold text-cci-950">Personas incluidas</h2>
        <ul className="mt-3 divide-y divide-cci-100 rounded-xl border border-cci-100">
          {result.attendees.map((attendee) => <li key={attendee.registration_code} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm"><span>{attendee.first_names} {attendee.last_names}<span className="ml-2 text-slate-500">{attendee.registration_code}</span></span><strong>{attendee.status === "confirmed" ? "Confirmada" : attendee.status === "pending" ? "Pendiente de pago" : "Cancelada"}</strong></li>)}
        </ul>
        {!result.is_free && whatsappUrl ? <a className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-[#B6EB66] px-5 font-bold text-cci-950 hover:bg-[#A4DC50] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-950" href={whatsappUrl} target="_blank" rel="noreferrer">Coordinar el pago por WhatsApp ↗</a> : null}
        <p className="mt-5 text-sm text-slate-600">Guarda el código de solicitud. No es necesario enviar datos de identidad por WhatsApp.</p>
      </div>
      <Link className="inline-block font-bold text-cci-700 underline underline-offset-4" href={`/eventos/${result.activity_slug}`}>← Volver al evento</Link>
    </main>
  );
}
