import Link from "next/link";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Text } from "@/components/atoms/Text";
import { FormField } from "@/components/molecules/FormField";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { ActivityAdminListTemplateProps } from "@/components/templates/ActivityAdminListTemplate/types/activity-admin-list-template.types";
import { ActivityAdminTable } from "@/features/activities/components/ActivityAdminTable";
import { ACTIVITY_STATUS_LABELS } from "@/features/activities/constants/activity.constants";
import { getAdminActivityRoute, getNewActivityRoute } from "@/features/activities/utils/activity-routes";

export function ActivityAdminListTemplate({ data, filters, title, type }: ActivityAdminListTemplateProps) {
  const baseRoute = getAdminActivityRoute(type);
  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading description={`${data.total} registros activos en el sistema.`} eyebrow="Gestión de actividades" title={title} />
        <Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cci-950 px-4 py-2 text-sm font-semibold text-white hover:bg-cci-800" href={getNewActivityRoute(type)}>Nueva actividad</Link>
      </div>
      <form className="grid gap-4 rounded-2xl border border-cci-100 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_240px_auto]">
        <FormField label="Buscar por título" name="q"><Input defaultValue={filters.query} id="q" name="q" /></FormField>
        <FormField label="Estado" name="estado"><Select defaultValue={filters.status ?? ""} id="estado" name="estado"><option value="">Todos</option>{Object.entries(ACTIVITY_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></FormField>
        <div className="flex items-end"><Button className="w-full lg:w-auto" type="submit">Filtrar</Button></div>
      </form>
      <ActivityAdminTable activities={data.activities} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><Text size="sm">Página {data.page} de {data.pageCount}</Text><div className="flex flex-wrap gap-2">{data.page > 1 ? <Link className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold" href={`${baseRoute}?pagina=${data.page - 1}`}>Anterior</Link> : null}{data.page < data.pageCount ? <Link className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold" href={`${baseRoute}?pagina=${data.page + 1}`}>Siguiente</Link> : null}</div></div>
    </div>
  );
}
