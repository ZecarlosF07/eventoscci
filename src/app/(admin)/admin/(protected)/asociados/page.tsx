import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { getCurrentAccount } from "@/features/auth/queries/get-current-account";
import { MemberRosterImportForm } from "@/features/member-roster/components/MemberRosterImportForm/MemberRosterImportForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function MemberRosterPage() {
  const account = await getCurrentAccount();
  if (!account?.isActive || account.role !== "administrator") notFound();

  const client = await createServerSupabaseClient();
  const [state, companies] = await Promise.all([
    client.from("member_roster_state").select("version").eq("singleton", true).single(),
    client.from("member_companies").select("ruc, legal_name", { count: "exact" })
      .eq("is_active", true).order("legal_name").limit(50),
  ]);
  if (state.error || companies.error) throw new Error("No fue posible cargar el padrón de asociados.");

  return (
    <div className="space-y-7">
      <SectionHeading description="Verifica los cambios antes de sustituir el archivo completo. Solo administradores pueden hacerlo." eyebrow="Asociados CCI" title="Padrón de RUC activos" />
      <MemberRosterImportForm activeCount={companies.count ?? 0} version={state.data.version} />
      <section className="rounded-3xl border border-cci-100 bg-white p-6">
        <h2 className="text-xl font-bold text-cci-950">Empresas activas</h2>
        <p className="mt-1 text-sm text-slate-600">Se muestran las primeras 50 por razón social.</p>
        <ul className="mt-4 divide-y divide-slate-100">
          {(companies.data ?? []).map((company) => <li className="flex flex-wrap justify-between gap-2 py-3 text-sm" key={company.ruc}><span className="font-semibold text-cci-950">{company.legal_name}</span><span className="font-mono text-slate-600">{company.ruc}</span></li>)}
        </ul>
      </section>
    </div>
  );
}
