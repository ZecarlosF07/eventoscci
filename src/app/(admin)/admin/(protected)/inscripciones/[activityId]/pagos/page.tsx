import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { OperationNotice } from "@/components/molecules/OperationNotice";
import { Pagination } from "@/components/molecules/Pagination";
import { FilterResults } from "@/features/admin-filters/components/FilterWorkspace";
import { FilterExportLink } from "@/features/admin-filters/components/FilterWorkspace";
import { ActivityPaymentFilters } from "@/features/participation/components/ActivityPaymentFilters/ActivityPaymentFilters";
import { ActivityPaymentList } from "@/features/participation/components/ActivityPaymentList/ActivityPaymentList";
import { CertificatePayments } from "@/features/participation/components/CertificatePayments/CertificatePayments";
import { ParticipationActivityTabs } from "@/features/participation/components/ParticipationActivityTabs/ParticipationActivityTabs";
import { PaymentRequestDetail } from "@/features/participation/components/PaymentRequestDetail/PaymentRequestDetail";
import { getActivityPayments, getActivityPaymentTotals, getCertificatePayments } from "@/features/participation/queries/get-activity-payments";
import { getParticipationActivitySummary } from "@/features/participation/queries/get-participation-overview";
import type { ActivityPaymentsPageProps } from "@/features/participation/types/payment.types";
import { getActivityPaymentsRoute } from "@/features/participation/utils/participation-routes";
import { firstPaymentValue, parsePaymentFilters, paymentFilterParams, paymentWorkspaceUrl } from "@/features/participation/utils/payment-filters";

export default async function ActivityPaymentsPage({ params, searchParams }: ActivityPaymentsPageProps) {
  const { activityId } = await params;
  if (!z.uuid().safeParse(activityId).success) notFound();
  const query = await searchParams;
  let filters = parsePaymentFilters(query);
  const [activity, participation, certificates, totals] = await Promise.all([
    getParticipationActivitySummary(activityId), getActivityPayments(activityId, filters), getCertificatePayments(activityId, filters),
    getActivityPaymentTotals(activityId),
  ]);
  if (!activity) notFound();
  filters = { ...filters, page: participation.page, certificatePage: certificates.page };
  const returnTo = paymentWorkspaceUrl(activityId, filters, filters.requestId, filters.certificateId);
  return <div className="space-y-6">
    <Link className="inline-flex min-h-11 items-center text-sm font-semibold text-cci-700" href="/admin/inscripciones">← Elegir otra actividad</Link>
    <header><p className="text-sm font-bold uppercase text-cci-700">Participación · Pagos</p><h1 className="text-3xl font-bold text-cci-950">{activity.title}</h1><p className="mt-2 text-slate-600">Valida los cobros de esta actividad. Cada grupo aparece como una sola solicitud.</p></header>
    <ParticipationActivityTabs activityId={activityId} current="payments" />
    <OperationNotice result={firstPaymentValue(query.resultado)} />
    <ActivityPaymentFilters filters={filters} />
    <section className="space-y-4" aria-labelledby="participation-payments-heading">
      <div><h2 className="text-2xl font-bold text-cci-950" id="participation-payments-heading">Pagos de participación</h2><p className="text-sm text-slate-600">{activity.paymentPendingRequests} solicitudes · {activity.paymentPendingSeats} plazas pendientes en toda la actividad. {participation.total} solicitudes con estos filtros.</p></div>
      <FilterExportLink className="inline-flex min-h-11 items-center text-sm font-semibold text-cci-700 underline" href={`${getActivityPaymentsRoute(activityId)}/exportar?${new URLSearchParams(paymentFilterParams(filters))}`}>Exportar solicitudes de participación filtradas (CSV)</FilterExportLink>
      <p className="rounded-2xl bg-cci-50 p-4 text-sm">Saldo de participación: <strong>S/ {(totals?.pending_amount ?? 0).toFixed(2)}</strong> · Validado: <strong>S/ {(totals?.validated_amount ?? 0).toFixed(2)}</strong>{(totals?.legacy_amount ?? 0) > 0 ? ` · Confirmaciones anteriores sin referencia: S/ ${totals?.legacy_amount?.toFixed(2)}` : ""}</p>
      {filters.requestId && !participation.items.some((item) => item.id === filters.requestId) ? <p className="rounded-xl bg-cci-50 p-3 text-sm">La solicitud abierta no aparece en esta página de resultados. Puedes seguir revisándola sin perder lo escrito.</p> : null}
      <PaymentRequestDetail activityId={activityId} filters={filters} />
      <FilterResults><ActivityPaymentList activityId={activityId} filters={filters} items={participation.items} /></FilterResults>
      <Pagination page={participation.page} pageCount={participation.pageCount} pathname={getActivityPaymentsRoute(activityId)} searchParams={paymentFilterParams(filters)} />
    </section>
    <div className="border-t border-cci-200 pt-6"><p className="mb-3 text-sm text-slate-600">Certificados: {activity.certificatePendingCount} pagos pendientes · Saldo: <strong>S/ {(totals?.certificate_pending_amount ?? 0).toFixed(2)}</strong> (separado de la participación).</p><FilterResults><CertificatePayments activityId={activityId} activityStatus={activity.status} data={certificates} filters={filters} returnTo={returnTo} /></FilterResults></div>
  </div>;
}
