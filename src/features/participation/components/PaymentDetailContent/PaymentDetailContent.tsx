"use client";

import Link from "next/link";

import { billingUrl } from "@/features/billing/utils/billing-filters";
import { MemberGroupPaymentForm } from "@/features/member-groups/components/MemberGroupPaymentForm/MemberGroupPaymentForm";
import { IndividualPaymentForm } from "@/features/participation/components/IndividualPaymentForm/IndividualPaymentForm";
import type { PaymentDetailContentProps } from "@/features/participation/types/payment-detail.types";

export function PaymentDetailContent({ activityId, detail, onVerified }: PaymentDetailContentProps) {
  const { request, payments } = detail;
  const group = request.kind === "group";
  return <section aria-labelledby="payment-detail-heading" className="space-y-4" id="detalle-pago">
    <div><p className="text-sm text-cci-700">{request.code}</p><h3 className="text-xl font-bold text-cci-950" id="payment-detail-heading">{request.name}</h3>{group ? <p className="mt-1 text-sm text-slate-600">RUC asociado: <strong className="text-cci-950">{request.companyRuc}</strong></p> : null}</div>
    <p className="text-sm">Saldo pendiente: <strong>S/ {request.pendingAmount.toFixed(2)}</strong> · Importe validado: <strong>S/ {request.validatedAmount.toFixed(2)}</strong></p>
    <Link href={`${billingUrl(activityId)}&solicitud=${request.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-cci-200 px-4 text-sm font-semibold text-cci-950 transition hover:bg-cci-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-700">Ver datos para comprobantes →</Link>
    {request.pendingCount > 0 ? group
      ? <MemberGroupPaymentForm detail={detail} onVerified={onVerified} />
      : <IndividualPaymentForm price={request.pendingAmount} registrationId={request.id} onVerified={onVerified} />
      : <p>Esta solicitud no tiene plazas pendientes de pago.</p>}
    {group ? <Link className="inline-flex min-h-11 items-center font-semibold text-cci-700 underline" href={`/admin/inscripciones/solicitudes/${request.id}`}>Ver asistentes y operaciones no monetarias</Link> : null}
    {payments.map((payment) => <div className="rounded-xl border p-4 text-sm" key={payment.id}>
      <strong>S/ {payment.amount.toFixed(2)}</strong> · {payment.reference}
      <p>{new Date(payment.verifiedAt).toLocaleString("es-PE", { timeZone: "America/Lima" })} · {payment.verifiedByName}</p>
      {payment.seats.length ? <p>Plazas: {payment.seats.join(", ")}</p> : null}
      {payment.note ? <p className="whitespace-pre-wrap break-words">{payment.note}</p> : null}
    </div>)}
    {request.legacyAmount > 0 ? <p className="text-sm text-slate-600">Confirmación anterior: S/ {request.legacyAmount.toFixed(2)}. No existe una referencia de pago registrada para ese importe.</p> : null}
  </section>;
}
