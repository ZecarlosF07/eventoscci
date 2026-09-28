import Link from "next/link";
import type { BillingWorkspaceTabsProps } from "@/features/billing/types/billing.types";
import { billingUrl } from "@/features/billing/utils/billing-filters";

export function BillingWorkspaceTabs({ activityId, current }: BillingWorkspaceTabsProps) {
  return <nav aria-label="Vistas de Pagos" className="flex flex-wrap gap-2 border-b border-cci-100 pb-3">{[
    { id: "payments", title: "Validar pagos", href: `/admin/inscripciones/${activityId}/pagos` },
    { id: "billing", title: "Datos para comprobantes", href: billingUrl(activityId) },
  ].map((tab) => <Link key={tab.id} href={tab.href} aria-current={current === tab.id ? "page" : undefined}
    className={`inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold ${current === tab.id ? "bg-cci-950 text-white" : "text-cci-800 hover:bg-cci-50"}`}>{tab.title}</Link>)}</nav>;
}
