import { PaymentRequestLink } from "@/features/participation/components/PaymentRequestLink/PaymentRequestLink";
import type { PaymentTableRowProps } from "@/features/participation/types/payment.types";
import { paymentAgeDays, paymentWorkspaceUrl } from "@/features/participation/utils/payment-filters";

export function PaymentTableRow({ item, activityId, filters }: PaymentTableRowProps) {
  return <tr className="hover:bg-cci-50/50">
    <td className="max-w-80 px-4 py-3 align-top"><p className="font-bold text-cci-950">{item.name}</p><p className="text-xs text-slate-600">{item.code} · {item.kind === "group" ? "Grupal" : "Individual"}</p>{item.company_ruc ? <p className="text-xs text-slate-600">RUC: {item.company_ruc}</p> : null}{(item.complimentary_count ?? 0) > 0 ? <p className="text-xs text-cci-700">{item.complimentary_count} pases gratuitos</p> : null}{item.status === "cancelled" ? <p className="text-xs">Cancelada</p> : null}</td>
    <td className="px-4 py-3 align-top font-semibold">{item.pending_count} de {item.seat_count}</td>
    <td className="px-4 py-3 align-top font-bold">S/ {(item.pending_amount ?? 0).toFixed(2)}</td>
    <td className="px-4 py-3 align-top"><p>S/ {(item.validated_amount ?? 0).toFixed(2)}</p>{(item.legacy_amount ?? 0) > 0 ? <p className="max-w-40 text-xs text-slate-600">S/ {item.legacy_amount?.toFixed(2)} históricos sin referencia</p> : null}</td>
    <td className="whitespace-nowrap px-4 py-3 align-top">{paymentAgeDays(item.created_at)} días</td>
    <td className="px-4 py-3 align-top"><PaymentRequestLink className="inline-flex min-h-11 items-center whitespace-nowrap rounded-xl bg-cci-950 px-4 text-sm font-bold text-white" href={paymentWorkspaceUrl(activityId, filters, item.id ?? undefined)} label={`Ver pago ${item.code}`} requestId={item.id} /></td>
  </tr>;
}
