import Link from "next/link";
import { notFound } from "next/navigation";

import { MemberGroupBillingEditor } from "@/features/member-groups/components/MemberGroupBillingEditor/MemberGroupBillingEditor";
import { MemberGroupPaymentForm } from "@/features/member-groups/components/MemberGroupPaymentForm/MemberGroupPaymentForm";
import { MemberGroupSeatCancel } from "@/features/member-groups/components/MemberGroupSeatCancel/MemberGroupSeatCancel";
import { getMemberGroupAdminDetail } from "@/features/member-groups/queries/get-member-group-admin-detail";

export default async function MemberGroupRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const detail = await getMemberGroupAdminDetail((await params).id);
  if (!detail) notFound();
  const active = detail.attendees.filter((seat) => seat.status !== "cancelled");
  const confirmed = active.filter((seat) => seat.status === "confirmed");
  const pending = active.filter((seat) => seat.status === "pending");
  const total = active.reduce((sum, seat) => sum + seat.price, 0);
  const confirmedAmount = confirmed.reduce((sum, seat) => sum + seat.price, 0);
  return <div className="space-y-7">
    <Link className="text-sm font-semibold text-cci-700 hover:underline" href="/admin/inscripciones/solicitudes">← Solicitudes grupales</Link>
    <header><p className="text-sm font-bold uppercase tracking-widest text-cci-700">{detail.request.code}</p><h1 className="mt-2 text-3xl font-bold text-cci-950">{detail.activity.title}</h1><p className="mt-2 text-slate-600">Solicitud creada el {new Date(detail.request.createdAt).toLocaleString("es-PE")} · {detail.request.ageDays} días de antigüedad</p></header>
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-cci-100 bg-white p-5"><h2 className="text-xl font-bold text-cci-950">Empresa asociada</h2><p className="mt-3 font-semibold">{detail.request.companyName}</p><p>RUC asociado: {detail.request.companyRuc}</p><p>Contacto principal: {detail.request.coordinatorEmail ?? "—"}</p></section>
      <section className="rounded-2xl border border-cci-100 bg-white p-5"><h2 className="text-xl font-bold text-cci-950">Comprobante solicitado</h2>{detail.request.isFree ? <p className="mt-3">Actividad gratuita; no se solicitaron datos de comprobante.</p> : <><p className="mt-3 font-semibold">{detail.request.billingType === "factura" ? "Factura" : "Boleta"}</p><p>{detail.request.billingType === "factura" ? "RUC de facturación" : "DNI"}: {detail.request.billingDocument}</p><p>{detail.request.billingName}</p>{detail.request.billingAddress ? <p>{detail.request.billingAddress}</p> : null}<MemberGroupBillingEditor detail={detail} /></>}</section>
    </div>
    <section className="grid gap-4 rounded-2xl bg-cci-950 p-5 text-white sm:grid-cols-4"><div><p>Plazas vigentes</p><strong className="text-2xl">{active.length}</strong></div><div><p>Confirmadas</p><strong className="text-2xl">{confirmed.length}</strong></div><div><p>Total</p><strong className="text-2xl">S/ {total.toFixed(2)}</strong></div><div><p>Pendiente</p><strong className="text-2xl text-[#B6EB66]">S/ {(total - confirmedAmount).toFixed(2)}</strong></div></section>
    {pending.length && !detail.request.isFree ? <MemberGroupPaymentForm detail={detail} /> : null}
    <section className="space-y-4"><h2 className="text-xl font-bold text-cci-950">Asistentes</h2>{detail.attendees.map((seat) => <article key={seat.id} className="rounded-2xl border border-cci-100 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-bold text-cci-950">{seat.firstNames} {seat.lastNames}</h3><p className="text-sm text-slate-600">{seat.code} · {seat.document}</p></div><strong className={seat.status === "pending" ? "text-amber-800" : seat.status === "confirmed" ? "text-cci-700" : "text-slate-500"}>{seat.status === "pending" ? "Pendiente" : seat.status === "confirmed" ? "Confirmada" : "Cancelada"}</strong></div><div className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><p>Correo: {seat.email}</p><p>Celular: {seat.phone}</p><p>Cargo: {seat.jobTitle ?? "—"}</p><p>Precio: S/ {seat.price.toFixed(2)}</p><p>Asistencia: {seat.attendance}</p><p>Certificado: {seat.certificate ?? "No emitido"}</p></div>{seat.status === "pending" || detail.request.isFree && seat.status === "confirmed" ? <MemberGroupSeatCancel requestId={detail.request.id} registrationId={seat.id} /> : null}</article>)}</section>
    {detail.payments.length ? <section className="space-y-3"><h2 className="text-xl font-bold text-cci-950">Pagos validados</h2>{detail.payments.map((payment) => <div key={payment.id} className="rounded-xl border border-cci-100 bg-white p-4 text-sm"><strong>S/ {payment.amount.toFixed(2)}</strong> · {payment.reference} · {new Date(payment.verifiedAt).toLocaleString("es-PE")} · {payment.verifiedByName}<p className="mt-1 text-slate-600">Plazas: {payment.seats.join(", ")}</p>{payment.note ? <p className="mt-1 text-slate-600">{payment.note}</p> : null}</div>)}</section> : null}
  </div>;
}
