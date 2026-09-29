import { ResponsiveTableFrame } from "@/components/molecules/ResponsiveTableFrame";
import { PaymentTableRow } from "@/features/participation/components/ActivityPaymentList/PaymentTableRow";
import { PaymentRequestLink } from "@/features/participation/components/PaymentRequestLink/PaymentRequestLink";

import type { PaymentListProps } from "@/features/participation/types/payment.types";
import { paymentAgeDays, paymentWorkspaceUrl } from "@/features/participation/utils/payment-filters";

export function ActivityPaymentList({ items, activityId, filters }: PaymentListProps) {
  if (!items.length) return <p className="rounded-2xl border border-dashed border-cci-200 p-6 text-slate-600">No hay solicitudes de participación con estos filtros.</p>;
  return <>
    <ResponsiveTableFrame className="hidden rounded-2xl lg:block" label="Solicitudes de pago de participación"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-cci-100 bg-cci-50 text-slate-600"><tr><th className="px-4 py-3">Solicitud / empresa</th><th className="px-4 py-3">Plazas pendientes</th><th className="px-4 py-3">Saldo pendiente</th><th className="px-4 py-3">Validado</th><th className="px-4 py-3">Antigüedad</th><th className="px-4 py-3">Detalle</th></tr></thead><tbody className="divide-y divide-slate-100">{items.map((item) => <PaymentTableRow activityId={activityId} filters={filters} item={item} key={item.id} />)}</tbody></table></ResponsiveTableFrame>
    <div className="space-y-3 lg:hidden">{items.map((item) => <article className="rounded-2xl border border-cci-100 bg-white p-5" key={item.id}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-xs font-bold uppercase text-cci-700">{item.kind === "group" ? "Solicitud grupal" : "Inscripción individual"} · {item.code}</p><h3 className="mt-1 text-lg font-bold text-cci-950">{item.name}</h3>{item.company_ruc ? <p className="text-sm text-slate-600">{item.kind === "group" ? "RUC asociado" : "RUC de empresa"}: {item.company_ruc}</p> : null}</div>
      <PaymentRequestLink className="inline-flex min-h-11 items-center rounded-xl bg-cci-950 px-4 text-sm font-bold text-white" href={paymentWorkspaceUrl(activityId, filters, item.id ?? undefined)} label={`Ver pago ${item.code}`} requestId={item.id} />
    </div>
    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
      <div><dt className="text-slate-600">Plazas pendientes</dt><dd className="font-bold">{item.pending_count} de {item.seat_count}</dd></div>
      <div><dt className="text-slate-600">Saldo pendiente</dt><dd className="font-bold">S/ {(item.pending_amount ?? 0).toFixed(2)}</dd></div>
      <div><dt className="text-slate-600">Importe validado</dt><dd className="font-bold">S/ {(item.validated_amount ?? 0).toFixed(2)}</dd></div>
      <div><dt className="text-slate-600">Antigüedad</dt><dd className="font-bold">{paymentAgeDays(item.created_at)} días</dd></div>
    </dl>
    {(item.complimentary_count ?? 0) > 0 ? <p className="mt-2 text-sm text-cci-700">{item.complimentary_count} plazas con pase gratuito (sin cobro).</p> : null}
    {(item.legacy_amount ?? 0) > 0 ? <p className="mt-2 text-sm text-slate-600">S/ {item.legacy_amount?.toFixed(2)} en confirmaciones anteriores, sin referencia de pago registrada.</p> : null}
    {item.status === "cancelled" ? <p className="mt-2 text-sm text-slate-600">Solicitud cancelada.</p> : null}
  </article>)}</div></>;
}
