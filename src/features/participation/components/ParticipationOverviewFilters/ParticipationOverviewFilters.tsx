import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { AutoFilterForm } from "@/features/admin-filters/components/AutoFilterForm";
import type { ParticipationOverviewFiltersProps } from "@/features/participation/types/participation.types";

export function ParticipationOverviewFilters({ filters, total }: ParticipationOverviewFiltersProps) {
  return (
    <AutoFilterForm total={total} className="md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_200px_200px_250px]" defaults={{ periodo: "upcoming" }}>
      <Input defaultValue={filters.query} name="q" aria-label="Buscar actividad" placeholder="Buscar actividad" type="search" />
      <Select aria-label="Tipo de actividad" defaultValue={filters.activityType ?? ""} name="tipo">
        <option value="">Eventos y capacitaciones</option>
        <option value="event">Eventos</option>
        <option value="training">Capacitaciones</option>
      </Select>
      <Select aria-label="Periodo" defaultValue={filters.period} name="periodo">
        <option value="upcoming">Próximas y en curso</option>
        <option value="past">Anteriores</option>
        <option value="all">Todas</option>
      </Select>
      <label className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold"><input defaultChecked={filters.paymentsOnly} name="pagos" type="checkbox" value="1" /><span>Solo con pagos pendientes<span className="block text-xs font-normal text-slate-600">Participación o certificados</span></span></label>
    </AutoFilterForm>
  );
}
