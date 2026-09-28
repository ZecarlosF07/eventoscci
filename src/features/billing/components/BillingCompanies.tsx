import Link from "next/link";
import type { BillingCompaniesProps } from "@/features/billing/types/billing.types";
import { billingMoney } from "@/features/billing/utils/billing-display";
import { billingUrl } from "@/features/billing/utils/billing-filters";

export function BillingCompanies({ companies, activityId, filters, children }: BillingCompaniesProps) {
  if (!companies.length) return <p>No hay empresas con estos filtros.</p>;
  return <div className="space-y-3">{companies.map((company) => <section className="rounded-xl border border-cci-100 bg-white p-4" key={company.company_key}>
    <Link href={billingUrl(activityId, { ...filters, company: filters.company === company.company_key ? undefined : company.company_key, companyPage: 1 })}
      aria-expanded={filters.company === company.company_key} className="flex min-h-11 flex-wrap items-center justify-between gap-3 font-semibold text-cci-950">
      <span>{company.company_name || "Empresa sin RUC asociado histórico"}<span className="mt-1 block text-sm font-normal text-slate-600">RUC asociado: {company.company_ruc || "—"}</span></span>
      <span className="text-sm">{company.request_count} solicitudes · Pendiente: {billingMoney(company.pending_amount)} · {filters.company === company.company_key ? "Cerrar −" : "Ver solicitudes +"}</span>
    </Link>{filters.company === company.company_key ? <div className="mt-4 space-y-3 border-t border-cci-100 pt-4">{children}</div> : null}
  </section>)}</div>;
}
