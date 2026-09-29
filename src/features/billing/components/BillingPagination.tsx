import Link from "next/link";
import type { BillingPaginationProps } from "@/features/billing/types/billing.types";
import { billingListUrl } from "@/features/billing/utils/billing-filters";

export function BillingPagination({ activityId, filters, page, pageCount, company = false }: BillingPaginationProps) {
  if (pageCount <= 1) return null;
  const href = (target: number) => billingListUrl(activityId, { ...filters, ...(company ? { companyPage: target } : { page: target }) });
  return <nav aria-label={company ? "Páginas de solicitudes de la empresa" : "Páginas de datos para comprobantes"} className="flex flex-wrap items-center gap-4 text-sm">
    {page > 1 ? <Link href={href(page - 1)} className="inline-flex min-h-11 items-center font-semibold text-cci-700">← Anterior</Link> : null}
    <span>Página {page} de {pageCount}</span>
    {page < pageCount ? <Link href={href(page + 1)} className="inline-flex min-h-11 items-center font-semibold text-cci-700">Siguiente →</Link> : null}
  </nav>;
}
