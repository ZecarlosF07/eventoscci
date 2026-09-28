import Link from "next/link";
import { billingUrl } from "@/features/billing/utils/billing-filters";

import { MemberGroupPaymentForm } from "@/features/member-groups/components/MemberGroupPaymentForm/MemberGroupPaymentForm";
import { getMemberGroupAdminDetail } from "@/features/member-groups/queries/get-member-group-admin-detail";
import { IndividualPaymentForm } from "@/features/participation/components/IndividualPaymentForm/IndividualPaymentForm";
import { getPaymentRequest } from "@/features/participation/queries/get-activity-payments";
import type { PaymentRequestDetailProps } from "@/features/participation/types/payment.types";
import { paymentWorkspaceUrl } from "@/features/participation/utils/payment-filters";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PaymentRequestDetail({ activityId, filters }: PaymentRequestDetailProps) {
  if (!filters.requestId) return null;
  const request = await getPaymentRequest(activityId, filters.requestId);
  if (!request?.id) return <p role="status">La solicitud no está disponible en esta actividad.</p>;
  const client = await createServerSupabaseClient();
  const group = request.kind === "group" ? await getMemberGroupAdminDetail(request.id) : null;
  const { data: payments, error } = request.kind === "individual" ? await client.from("individual_registration_payments")
    .select("id, amount, payment_reference, note, verified_at, verified_by").eq("registration_id", request.id)
    : { data: [], error: null };
  if (error) throw new Error("No fue posible consultar el historial del pago.", { cause: error });
  const actors = [...new Set((payments ?? []).map((payment) => payment.verified_by))];
  const { data: accounts, error: actorError } = actors.length ? await client.from("user_accounts")
    .select("user_id, person:people!inner(first_names, last_names)").in("user_id", actors)
    : { data: [], error: null };
  if (actorError) throw new Error("No fue posible identificar al responsable del pago.", { cause: actorError });
  const names = new Map((accounts ?? []).map((account) => [account.user_id, `${account.person.first_names} ${account.person.last_names}`]));
  return <section aria-labelledby="payment-detail-heading" className="space-y-4 rounded-3xl border-2 border-cci-200 bg-white p-5" id="detalle-pago">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-cci-700">{request.code}</p><h2 className="text-xl font-bold text-cci-950" id="payment-detail-heading">{request.name}</h2></div><Link className="inline-flex min-h-11 items-center rounded-xl border px-4 font-semibold" href={paymentWorkspaceUrl(activityId, filters)}>Cerrar detalle</Link></div>
    <p className="text-sm">Saldo pendiente: <strong>S/ {(request.pending_amount ?? 0).toFixed(2)}</strong> · Importe validado: <strong>S/ {(request.validated_amount ?? 0).toFixed(2)}</strong></p>
    <Link href={`${billingUrl(activityId)}&solicitud=${request.id}`} className="inline-flex min-h-11 items-center font-semibold text-cci-700 underline">Consultar o corregir datos para comprobantes →</Link>
    {group ? <>
      <div className="rounded-xl bg-cci-50 p-4 text-sm"><p>RUC asociado: <strong>{group.request.companyRuc}</strong></p><p>Comprobante solicitado: {group.request.billingType ?? "No requerido"}</p>{group.request.billingDocument ? <p>{group.request.billingType === "factura" ? "RUC de facturación" : "DNI"}: {group.request.billingDocument} · {group.request.billingName}</p> : null}{group.request.billingAddress ? <p>Dirección: {group.request.billingAddress}</p> : null}</div>
      {(request.pending_count ?? 0) > 0 ? <MemberGroupPaymentForm detail={group} /> : <p>Esta solicitud no tiene plazas pendientes de pago.</p>}
      <Link className="inline-flex min-h-11 items-center font-semibold text-cci-700 underline" href={`/admin/inscripciones/solicitudes/${group.request.id}`}>Ver asistentes, comprobante y operaciones no monetarias</Link>
      {group.payments.map((payment) => <div className="rounded-xl border p-4 text-sm" key={payment.id}><strong>S/ {payment.amount.toFixed(2)}</strong> · {payment.reference}<p>{new Date(payment.verifiedAt).toLocaleString("es-PE", { timeZone: "America/Lima" })} · {payment.verifiedByName}</p><p>Plazas: {payment.seats.join(", ")}</p>{payment.note ? <p className="whitespace-pre-wrap break-words">{payment.note}</p> : null}</div>)}
    </> : <>
      {(request.pending_count ?? 0) > 0 ? <IndividualPaymentForm price={request.pending_amount ?? 0} registrationId={request.id} /> : <p>No hay pago pendiente para esta inscripción.</p>}
      {(payments ?? []).map((payment) => <div className="rounded-xl border p-4 text-sm" key={payment.id}><strong>S/ {payment.amount.toFixed(2)}</strong> · {payment.payment_reference}<p>{new Date(payment.verified_at).toLocaleString("es-PE", { timeZone: "America/Lima" })} · {names.get(payment.verified_by) ?? "Personal CCI"}</p>{payment.note ? <p className="whitespace-pre-wrap break-words">{payment.note}</p> : null}</div>)}
    </>}
    {(request.legacy_amount ?? 0) > 0 ? <p className="text-sm text-slate-600">Confirmación anterior: S/ {request.legacy_amount?.toFixed(2)}. No existe una referencia de pago registrada para ese importe.</p> : null}
  </section>;
}
