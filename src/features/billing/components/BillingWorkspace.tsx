import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { FilterExportLink, FilterResults } from "@/features/admin-filters/components/FilterWorkspace";
import { BillingCompanies } from "@/features/billing/components/BillingCompanies";
import { BillingDetail } from "@/features/billing/components/BillingDetail";
import { BillingList } from "@/features/billing/components/BillingList";
import { BillingPagination } from "@/features/billing/components/BillingPagination";
import { BillingToolbar } from "@/features/billing/components/BillingToolbar";
import { BillingWorkspaceTabs } from "@/features/billing/components/BillingWorkspaceTabs";
import { getBillingCompanies, getBillingDetail, getBillingRequests } from "@/features/billing/queries/get-billing";
import type { BillingPageProps } from "@/features/billing/types/billing.types";
import { billingParams, parseBillingFilters } from "@/features/billing/utils/billing-filters";
import { ParticipationActivityTabs } from "@/features/participation/components/ParticipationActivityTabs/ParticipationActivityTabs";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function BillingWorkspace({ activityId, query }: BillingPageProps) {
  await requireAdmin();
  const client = await createServerSupabaseClient();
  const { data: activity, error } = await client.from("activities").select("id,title,type,members_only,status").eq("id", activityId).is("deleted_at", null).neq("status", "archived").maybeSingle();
  if (error) throw new Error("No fue posible consultar la actividad.", { cause: error });
  if (!activity) notFound();
  let filters = parseBillingFilters(query);
  const grouped = activity.type === "event" && activity.members_only;
  const [companies, requests, detail] = await Promise.all([
    grouped ? getBillingCompanies(activityId, filters) : null,
    !grouped || filters.company ? getBillingRequests(activityId, filters, grouped) : null,
    getBillingDetail(activityId, filters.requestId),
  ]);
  filters = { ...filters, page: companies?.page ?? requests?.page ?? filters.page, companyPage: grouped ? requests?.page ?? filters.companyPage : filters.companyPage };
  const total = companies?.total ?? requests?.total ?? 0;
  const list = requests ? <><BillingList activityId={activityId} filters={filters} items={requests.items} /><BillingPagination activityId={activityId} filters={filters} page={requests.page} pageCount={requests.pageCount} company={grouped} /></> : null;
  return <div className="space-y-5">
    <Link href="/admin/inscripciones" className="inline-flex min-h-11 items-center text-sm font-semibold text-cci-700">← Elegir otra actividad</Link>
    <header><p className="text-sm font-bold uppercase text-cci-700">Participación · Pagos</p><h1 className="text-3xl font-bold text-cci-950">{activity.title}</h1></header>
    <ParticipationActivityTabs activityId={activityId} current="payments" /><BillingWorkspaceTabs activityId={activityId} current="billing" />
    <div><h2 className="text-2xl font-bold text-cci-950">Datos para comprobantes</h2><p className="mt-1 text-sm text-slate-600">Consulta, copia o corrige datos para emitir en otro sistema. No se emiten comprobantes ni se validan pagos aquí.</p></div>
    <BillingToolbar filters={filters} total={total} />
    <FilterExportLink href={`/admin/inscripciones/${activityId}/pagos/comprobantes/exportar?${new URLSearchParams(billingParams(filters))}`} className="inline-flex min-h-11 items-center font-semibold text-cci-700 underline">Exportar datos filtrados (CSV)</FilterExportLink>
    {detail ? <><p className="text-sm text-slate-600">La solicitud abierta se conserva al filtrar; puede no estar entre los resultados actuales.</p><BillingDetail item={detail} activityId={activityId} filters={filters} /></> : filters.requestId ? <p role="status">La solicitud no está disponible.</p> : null}
    <FilterResults><p className="mb-3 text-sm text-slate-600">{total} {grouped ? total === 1 ? "empresa" : "empresas" : total === 1 ? "solicitud" : "solicitudes"} con estos filtros · Incluye historial cancelado.</p>
      {companies ? <><BillingCompanies companies={companies.items} activityId={activityId} filters={filters}>{list}</BillingCompanies><BillingPagination activityId={activityId} filters={filters} page={companies.page} pageCount={companies.pageCount} /></> : list}
    </FilterResults>
  </div>;
}
