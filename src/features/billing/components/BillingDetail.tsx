import { BillingEditor } from "@/features/billing/components/BillingEditor";
import { CopyBilling } from "@/features/billing/components/CopyBilling";
import type { BillingDetailProps } from "@/features/billing/types/billing.types";
import { billingCopyText, billingLabel, billingMoney, billingStateLabel } from "@/features/billing/utils/billing-display";

export function BillingDetail({ item, onSaved }: BillingDetailProps) {
  return <section className="space-y-4 break-words" id="detalle-comprobante" aria-label={`Datos de la solicitud ${item.code}`}>
    <h3 className="text-xl font-bold text-cci-950">{item.code} · {billingStateLabel(item.status)}</h3>
    <div className="grid gap-5 md:grid-cols-2"><div><h3 className="font-semibold">{item.kind === "group" ? "Empresa asociada" : "Participante"}</h3><p>{item.name}</p>{item.company_name && item.company_name !== item.name ? <p>{item.company_name}</p> : null}{item.company_ruc ? <p>RUC asociado: {item.company_ruc}</p> : null}</div>
      <div className="break-words"><h3 className="font-semibold">Destinatario del comprobante · {billingLabel(item)}</h3>{item.billing_type ? <><p>{item.billing_type === "factura" ? "RUC de facturación" : "DNI"}: {item.billing_document}</p><p>{item.billing_name}</p><p className="whitespace-pre-line">{item.billing_address}</p><CopyBilling text={billingCopyText(item)} /></> : <p className="mt-2 text-sm text-slate-600">{item.billing_state === "missing" ? "Inscripción anterior sin datos. No se completará automáticamente ni se habilita su carga administrativa." : "La participación no tiene importe por cobrar."}</p>}</div></div>
    <p className="rounded-xl bg-cci-50 p-3 text-sm">Participación: {billingMoney(item.participation_amount)} · Validado: {billingMoney(item.validated_amount)} · Pendiente: {billingMoney(item.pending_amount)}{(item.legacy_amount ?? 0) > 0 ? ` · Confirmación anterior sin pago registrado: ${billingMoney(item.legacy_amount)}` : ""}{(item.complimentary_count ?? 0) > 0 ? ` · Cortesías: ${item.complimentary_count}` : ""}</p>
    <p className="text-sm text-slate-600">El importe de participación conserva el total solicitado, incluidas plazas canceladas; el saldo excluye cancelaciones. Estos datos no indican que exista un comprobante emitido.</p>
    <BillingEditor item={item} key={item.id} onSaved={onSaved} />
  </section>;
}
