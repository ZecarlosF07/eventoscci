import Link from "next/link";

import { CertificateCommercialActions } from "@/features/registrations/components/CertificateCommercialActions";
import type { CertificatePaymentsProps } from "@/features/participation/types/payment.types";
import { paymentFilterParams, paymentWorkspaceUrl } from "@/features/participation/utils/payment-filters";
import { getActivityPaymentsRoute } from "@/features/participation/utils/participation-routes";

export function CertificatePayments({ data, activityId, activityStatus, filters, returnTo }: CertificatePaymentsProps) {
  const params = paymentFilterParams(filters);
  const pageUrl = (page: number) => `${getActivityPaymentsRoute(activityId)}?${new URLSearchParams({ ...params, pagina_certificados: String(page) })}#certificados`;
  return <section className="space-y-4 scroll-mt-6" id="certificados">
    <div><h2 className="text-2xl font-bold text-cci-950">Certificados opcionales</h2><p className="text-sm text-slate-600">{data.total} solicitudes con estos filtros. Su cobro es independiente de la participación.</p></div>
    {!data.items.length ? <p className="rounded-2xl border border-dashed border-cci-200 p-6">No hay solicitudes de certificado con estos filtros.</p> : null}
    {data.items.map((item) => <article className="space-y-3 rounded-2xl border border-cci-100 bg-white p-5" id={`certificado-${item.id}`} key={item.id}>
      <div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-bold text-cci-950">{item.name}</h3><p className="text-sm text-slate-600">{item.code} · {item.phone}</p><p className="text-sm">Precio del certificado: S/ {(item.price ?? 0).toFixed(2)}</p></div>
        <Link className="inline-flex min-h-11 items-center rounded-xl border border-cci-200 px-4 text-sm font-semibold" href={paymentWorkspaceUrl(activityId, filters, undefined, item.id ?? undefined)}>Gestionar certificado</Link></div>
      <p className="text-sm">{item.issued ? "Certificado emitido; pago bloqueado para cambios." : item.verified_at ? `Pago verificado el ${new Date(item.verified_at).toLocaleString("es-PE", { timeZone: "America/Lima" })}` : item.registration_status !== "confirmed" ? "Requiere confirmar participación" : "Pago pendiente"}</p>
      {filters.certificateId === item.id ? <CertificateCommercialActions activityId={activityId}
        certificateIssued={item.issued ?? false} certificatePaymentVerified={Boolean(item.verified_at)} certificatePrice={item.price ?? 0}
        certificateRequested disabled={item.registration_status === "cancelled" || !["published", "finished"].includes(activityStatus)} participantName={item.name ?? "Participante"}
        paymentWorkspace registrationConfirmed={item.registration_status === "confirmed"} registrationId={item.id ?? ""} returnTo={returnTo} /> : null}
    </article>)}
    <nav aria-label="Paginación de certificados" className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm">Página {data.page} de {data.pageCount}</p><div className="flex gap-3">{data.page > 1 ? <Link className="inline-flex min-h-11 items-center rounded-xl border px-4" href={pageUrl(data.page - 1)}>Anterior</Link> : null}{data.page < data.pageCount ? <Link className="inline-flex min-h-11 items-center rounded-xl border px-4" href={pageUrl(data.page + 1)}>Siguiente</Link> : null}</div></nav>
  </section>;
}
