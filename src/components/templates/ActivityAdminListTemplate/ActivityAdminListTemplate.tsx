import Link from "next/link";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { ActivityAdminListTemplateProps } from "@/components/templates/ActivityAdminListTemplate/types/activity-admin-list-template.types";
import { ActivityAdminTable } from "@/features/activities/components/ActivityAdminTable";
import { ACTIVITY_STATUS_LABELS } from "@/features/activities/constants/activity.constants";
import { getAdminActivityRoute, getNewActivityRoute } from "@/features/activities/utils/activity-routes";

export function ActivityAdminListTemplate({ data, filters, title, type }: ActivityAdminListTemplateProps) {
  const baseRoute = getAdminActivityRoute(type);
  const archived = filters.view === "archived";
  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading description={archived ? `${data.total} actividades archivadas.` : `${data.total} registros activos en el sistema.`} eyebrow="Gestión de actividades" title={title} />
        <Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cci-950 px-4 py-2 text-sm font-semibold text-white hover:bg-cci-800" href={getNewActivityRoute(type)}>Nueva actividad</Link>
      </div>
      <nav aria-label={`Vistas de ${title.toLowerCase()}`} className="flex flex-wrap gap-2 rounded-2xl border border-cci-100 bg-white p-2">
        <Link aria-current={!archived ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-bold ${!archived ? "bg-cci-950 text-white" : "text-slate-700 hover:bg-cci-50"}`} href={baseRoute}>Activos</Link>
        <Link aria-current={archived ? "page" : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold ${archived ? "bg-cci-950 text-white" : "text-slate-700 hover:bg-cci-50"}`} href={`${baseRoute}?vista=archivados`}>Archivados <span className={`rounded-full px-2 py-0.5 text-xs ${archived ? "bg-white/15" : "bg-slate-100"}`}>{data.archivedTotal}</span></Link>
      </nav>
      <form className={`grid gap-4 rounded-2xl border border-cci-100 bg-white p-4 ${archived ? "lg:grid-cols-[minmax(0,1fr)_auto]" : "lg:grid-cols-[minmax(0,1fr)_240px_auto]"}`}>
        {archived ? <input name="vista" type="hidden" value="archivados" /> : null}
        <FormField label="Buscar por título" name="q"><Input defaultValue={filters.query} id="q" name="q" /></FormField>
        {!archived ? <FormField label="Estado" name="estado"><Select defaultValue={filters.status ?? ""} id="estado" name="estado"><option value="">Todos</option>{Object.entries(ACTIVITY_STATUS_LABELS).filter(([value]) => value !== "archived").map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></FormField> : null}
        <div className="flex items-end"><Button className="w-full lg:w-auto" type="submit">Filtrar</Button></div>
      </form>
      <ActivityAdminTable activities={data.activities} />
      <Pagination page={data.page} pageCount={data.pageCount} pathname={baseRoute} searchParams={{ estado: filters.status, q: filters.query, vista: archived ? "archivados" : undefined }} />
    </div>
  );
}
