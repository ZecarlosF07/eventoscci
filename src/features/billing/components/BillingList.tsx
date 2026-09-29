import type { BillingListProps } from "@/features/billing/types/billing.types";
import { billingLabel, billingMoney, billingStateLabel } from "@/features/billing/utils/billing-display";
import { billingUrl } from "@/features/billing/utils/billing-filters";
import { PaymentRequestLink } from "@/features/participation/components/PaymentRequestLink/PaymentRequestLink";

export function BillingList({ items, activityId, filters }: BillingListProps) {
  if (!items.length) return <p className="rounded-xl border border-cci-100 bg-white p-4">No hay solicitudes con estos filtros.</p>;
  return <div className="overflow-x-auto rounded-xl border border-cci-100 bg-white"><table className="w-full text-left text-sm">
    <caption className="sr-only">Datos para emisión externa. Una fila por solicitud.</caption>
    <thead className="bg-cci-50"><tr>{["Solicitud / fecha", "Empresa o participante", "Comprobante / destinatario", "Participación", "Validado", "Pendiente", "Situación"].map((label) => <th className="p-3 font-semibold" key={label} scope="col">{label}</th>)}</tr></thead>
    <tbody>{items.map((item) => <tr className="border-t border-cci-100 align-top" key={item.id}>
      <td className="p-3"><p className="font-bold text-cci-950">{item.code}</p><p>{item.kind === "group" ? "Solicitud grupal" : "Inscripción individual"}</p><p className="whitespace-nowrap text-slate-600">{item.created_at ? new Date(item.created_at).toLocaleDateString("es-PE", { timeZone: "America/Lima" }) : "—"}</p>
        <PaymentRequestLink className="mt-2 inline-flex min-h-11 items-center whitespace-nowrap rounded-xl bg-cci-950 px-4 font-bold text-white shadow-sm transition hover:bg-cci-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-700" dialogId="billing-request-dialog" href={billingUrl(activityId, { ...filters, requestId: item.id ?? undefined })} label={`Ver datos del comprobante ${item.code}`} requestId={item.id} text="Ver datos →" />
      </td>
      <td className="min-w-40 p-3"><p>{item.name}</p>{item.company_ruc ? <p className="mt-1 text-slate-600">RUC asociado: {item.company_ruc}</p> : null}</td>
      <td className="min-w-44 p-3"><strong>{billingLabel(item)}</strong><p>{item.billing_name}</p><p className="text-slate-600">{item.billing_document}</p></td>
      <td className="whitespace-nowrap p-3">{billingMoney(item.participation_amount)}{(item.complimentary_count ?? 0) > 0 ? <p className="text-slate-600">{item.complimentary_count} cortesías</p> : null}</td>
      <td className="whitespace-nowrap p-3">{billingMoney(item.validated_amount)}{(item.legacy_amount ?? 0) > 0 ? <p className="text-slate-600">Anterior sin pago registrado: {billingMoney(item.legacy_amount)}</p> : null}</td>
      <td className="whitespace-nowrap p-3">{billingMoney(item.pending_amount)}</td><td className="p-3">{billingStateLabel(item.status)}</td>
    </tr>)}</tbody>
  </table></div>;
}
