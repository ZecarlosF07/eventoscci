import Link from "next/link";
import { z } from "zod";

import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { getMemberGroupAdminList } from "@/features/member-groups/queries/get-member-group-admin-list";
import { getRegistrationActivityOptions } from "@/features/registrations/queries/get-activity-registrations";

interface PageProps { searchParams: Promise<Record<string, string | string[] | undefined>> }
const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function MemberGroupRequestsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = one(params.q)?.trim().slice(0, 100) ?? "";
  const activityValue = one(params.actividad) ?? "";
  const activityId = z.uuid().safeParse(activityValue).success ? activityValue : "";
  const statusValue = one(params.estado) ?? "";
  const status = statusValue === "pending" || statusValue === "partial" || statusValue === "complete" ? statusValue : undefined;
  const page = Math.max(1, Math.min(100000, Number.parseInt(one(params.pagina) ?? "1", 10) || 1));
  const [data, activities] = await Promise.all([getMemberGroupAdminList({ activityId, page, query, status }), getRegistrationActivityOptions()]);
  return <div className="space-y-7">
    <Link className="text-sm font-semibold text-slate-700 hover:underline" href="/admin/inscripciones/pendientes">← Pagos por verificar</Link>
    <SectionHeading eyebrow="Asociados CCI" title="Solicitudes grupales" description="Una fila por solicitud. Los cupos pendientes siguen reservados hasta su confirmación o cancelación manual." />
    <form className="grid gap-3 rounded-2xl border border-cci-100 bg-white p-4 md:grid-cols-[2fr_1fr_1fr_auto]" method="get">
      <label className="text-sm font-semibold">Buscar por RUC, código, asistente o referencia<input className="mt-1 min-h-11 w-full rounded-xl border border-cci-200 px-3" name="q" defaultValue={query} maxLength={100} /></label>
      <label className="text-sm font-semibold">Actividad<select className="mt-1 min-h-11 w-full rounded-xl border border-cci-200 px-3" name="actividad" defaultValue={activityId}><option value="">Todas</option>{activities.map((activity) => <option value={activity.id} key={activity.id}>{activity.title}</option>)}</select></label>
      <label className="text-sm font-semibold">Estado<select className="mt-1 min-h-11 w-full rounded-xl border border-cci-200 px-3" name="estado" defaultValue={status ?? ""}><option value="">Todos</option><option value="pending">Pendiente</option><option value="partial">Parcial</option><option value="complete">Sin pendientes</option></select></label>
      <button className="min-h-11 self-end rounded-xl bg-cci-950 px-5 font-bold text-white" type="submit">Filtrar</button>
    </form>
    {data.ruc_summary ? <p className="rounded-xl bg-cci-50 p-4 text-sm" role="status">Este RUC tiene <strong>{data.ruc_summary.requests} solicitudes</strong>, {data.ruc_summary.seats} plazas y S/ {data.ruc_summary.pending.toFixed(2)} pendientes.</p> : null}
    <p className="text-sm text-slate-600">{data.total} solicitudes encontradas</p>
    <Link className="inline-flex min-h-11 items-center rounded-xl border border-cci-200 px-4 text-sm font-bold text-cci-950" href={`/admin/inscripciones/solicitudes/exportar?${new URLSearchParams({ q: query, actividad: activityId, estado: status ?? "" })}`}>Exportar CSV filtrado</Link>
    <div className="space-y-3">{data.items.map((item) => <Link key={item.id} href={`/admin/inscripciones/solicitudes/${item.id}`} className="block rounded-2xl border border-cci-100 bg-white p-5 transition hover:border-cci-500 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-cci-700">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-cci-700">{item.request_code} · {item.group_status === "partial" ? "Pago parcial" : item.group_status === "pending" ? "Pendiente" : "Sin pendientes"}</p><h2 className="mt-1 font-bold text-cci-950">{item.company_name_snapshot} · RUC {item.company_ruc}</h2><p className="text-sm text-slate-600">{item.activity_title} · Responsable: {item.coordinator_name}</p></div><span className="text-sm text-slate-600">{item.age_days} días de antigüedad</span></div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm"><span>{item.confirmed_count}/{item.seat_count} plazas confirmadas</span><span>{item.complimentary_used}/{item.complimentary_quota} pases usados por este RUC</span><span>Total S/ {item.total.toFixed(2)}</span><strong className="text-amber-800">Pendiente S/ {item.pending_amount.toFixed(2)}</strong><span>{item.billing_type === "factura" ? `Factura a RUC ${item.billing_document}` : item.billing_type === "boleta" ? "Boleta" : "Sin importe por cobrar"}</span></div>
    </Link>)}</div>
    <Pagination page={page} pageCount={Math.max(1, Math.ceil(data.total / 20))} pathname="/admin/inscripciones/solicitudes" searchParams={{ q: query, actividad: activityId, estado: status ?? "" }} />
  </div>;
}
