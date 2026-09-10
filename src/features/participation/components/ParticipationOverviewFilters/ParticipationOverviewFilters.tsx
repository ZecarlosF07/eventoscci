import Link from "next/link";

import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { ROUTES } from "@/constants/routes";
import type { ParticipationOverviewFilters as Filters } from "@/features/participation/types/participation.types";

export function ParticipationOverviewFilters({ filters }: { filters: Filters }) {
  return (
    <form className="grid gap-3 rounded-2xl border border-cci-100 bg-white p-4 md:grid-cols-[minmax(220px,1fr)_180px_180px_auto_auto]" method="get">
      <Input defaultValue={filters.query} name="q" placeholder="Buscar actividad" type="search" />
      <Select aria-label="Tipo de actividad" defaultValue={filters.activityType ?? ""} name="tipo">
        <option value="">Eventos y capacitaciones</option>
        <option value="event">Eventos</option>
        <option value="training">Capacitaciones</option>
      </Select>
      <Select aria-label="Periodo" defaultValue={filters.period} name="periodo">
        <option value="upcoming">Próximas</option>
        <option value="past">Anteriores</option>
        <option value="all">Todas</option>
      </Select>
      <button className="min-h-11 rounded-xl bg-cci-950 px-5 text-sm font-bold text-white hover:bg-cci-800" type="submit">Aplicar</button>
      <Link className="flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold hover:bg-cci-50" href={ROUTES.adminRegistrations}>Limpiar</Link>
    </form>
  );
}
