import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { AutoFilterForm } from "@/features/admin-filters/components/AutoFilterForm";
import type { ParticipationOverviewFiltersProps } from "@/features/participation/types/participation.types";

export function ParticipationOverviewFilters({ filters, total }: ParticipationOverviewFiltersProps) {
  return (
    <AutoFilterForm total={total} className="grid gap-3 rounded-2xl border border-cci-100 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_200px_220px]" defaults={{ periodo: "upcoming" }}>
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
      <label className="col-span-full flex min-h-11 items-center gap-3 rounded-xl bg-cci-50 p-3 text-sm font-semibold"><input defaultChecked={filters.paymentsOnly} name="pagos" type="checkbox" value="1" />Solo con pagos pendientes (participación o certificados)</label>
    </AutoFilterForm>
  );
}
