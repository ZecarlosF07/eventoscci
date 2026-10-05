import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import type { ActivityFiltersProps } from "@/features/activities/components/ActivityFilters/types/activity-filters.types";

export function ActivityFilters({ categories, filters }: ActivityFiltersProps) {
  return (
    <form className="rounded-2xl border border-cci-100 bg-white p-4 shadow-lg shadow-cci-950/5">
      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <FormField label="Buscar" name="q"><Input defaultValue={filters.query} id="q" name="q" placeholder="Título o tema de la actividad" /></FormField>
        </div>
        <Button className="shrink-0" type="submit">Buscar</Button>
      </div>
      <details className="mt-2" open={Boolean(filters.modality || filters.category || filters.price || filters.date)}>
        <summary className="min-h-11 cursor-pointer rounded-lg py-3 text-sm font-semibold text-cci-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-800">Filtrar por modalidad, categoría, precio o fecha</summary>
        <div className="grid grid-cols-2 gap-3 border-t border-cci-100 pt-3 lg:grid-cols-4">
          <FormField label="Modalidad" name="modalidad">
            <Select defaultValue={filters.modality ?? ""} id="modalidad" name="modalidad"><option value="">Todas</option><option value="in_person">Presencial</option><option value="virtual">Virtual</option><option value="hybrid">Híbrida</option></Select>
          </FormField>
          <FormField label="Categoría" name="categoria">
            <Select defaultValue={filters.category ?? ""} id="categoria" name="categoria"><option value="">Todas</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select>
          </FormField>
          <FormField label="Precio" name="precio">
            <Select defaultValue={filters.price ?? ""} id="precio" name="precio"><option value="">Todos</option><option value="free">Gratis</option><option value="paid">Con costo</option></Select>
          </FormField>
          <FormField label="Desde la fecha" name="fecha"><Input className="min-w-0" defaultValue={filters.date} id="fecha" name="fecha" type="date" /></FormField>
        </div>
        <Button className="mt-3" type="submit">Aplicar filtros</Button>
      </details>
    </form>
  );
}
