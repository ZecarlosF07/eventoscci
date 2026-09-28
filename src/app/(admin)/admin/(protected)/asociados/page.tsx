import { notFound } from "next/navigation";

import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { getCurrentAccount } from "@/features/auth/queries/get-current-account";
import { MemberRosterFilters } from "@/features/member-roster/components/MemberRosterFilters";
import { MemberRosterImportForm } from "@/features/member-roster/components/MemberRosterImportForm/MemberRosterImportForm";
import type { MemberRosterPageProps } from "@/features/member-roster/types/member-roster.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { escapePostgrestSearch } from "@/utils/postgrest-search";

export default async function MemberRosterPage({ searchParams }: MemberRosterPageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = rawQuery?.trim().slice(0, 150);
  const rawPage = Number(Array.isArray(params.pagina) ? params.pagina[0] : params.pagina);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const account = await getCurrentAccount();
  if (!account?.isActive || account.role !== "administrator") notFound();

  const client = await createServerSupabaseClient();
  let companiesQuery = client.from("member_companies").select("ruc, legal_name", { count: "exact" }).eq("is_active", true);
  if (query) { const pattern = JSON.stringify(`%${escapePostgrestSearch(query)}%`); companiesQuery = companiesQuery.or(`ruc.ilike.${pattern},legal_name.ilike.${pattern}`); }
  const [state, companies, activeTotal] = await Promise.all([
    client.from("member_roster_state").select("version").eq("singleton", true).single(),
    companiesQuery.order("legal_name").order("ruc").range((page - 1) * 50, page * 50 - 1),
    client.from("member_companies").select("ruc", { count: "exact", head: true }).eq("is_active", true),
  ]);
  if (state.error || companies.error || activeTotal.error) throw new Error("No fue posible cargar el padrón de asociados.");

  return (
    <div className="space-y-7">
      <SectionHeading description="Verifica los cambios antes de sustituir el archivo completo. Solo administradores pueden hacerlo." eyebrow="Asociados CCI" title="Padrón de RUC activos" />
      <MemberRosterImportForm activeCount={activeTotal.count ?? 0} version={state.data.version} />
      <MemberRosterFilters query={query} total={companies.count ?? 0} />
      <section className="rounded-3xl border border-cci-100 bg-white p-6">
        <h2 className="text-xl font-bold text-cci-950">Empresas activas</h2>
        <p className="mt-1 text-sm text-slate-600">{companies.count ?? 0} coincidencias · 50 empresas por página.</p>
        <ul className="mt-4 divide-y divide-slate-100">
          {(companies.data ?? []).map((company) => <li className="flex flex-wrap justify-between gap-2 py-3 text-sm" key={company.ruc}><span className="font-semibold text-cci-950">{company.legal_name}</span><span className="font-mono text-slate-600">{company.ruc}</span></li>)}
        </ul>
        {!companies.data?.length ? <p className="py-4 text-sm">No hay empresas con esta búsqueda.</p> : null}
      </section>
      <Pagination page={page} pageCount={Math.max(1, Math.ceil((companies.count ?? 0) / 50))} pathname="/admin/asociados" searchParams={{ q: query }} />
    </div>
  );
}
