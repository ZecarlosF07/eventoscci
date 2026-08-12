import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import type { ActivityFiltersProps } from "@/features/activities/components/ActivityFilters/types/activity-filters.types";

export function ActivityFilters({ categories, filters }: ActivityFiltersProps) {
  return (
    <form className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 lg:grid-cols-6">
      <div className="lg:col-span-2">
        <FormField label="Buscar" name="q"><Input defaultValue={filters.query} id="q" name="q" placeholder="Título, descripción o categoría" /></FormField>
      </div>
      <FormField label="Modalidad" name="modalidad">
        <Select defaultValue={filters.modality ?? ""} id="modalidad" name="modalidad"><option value="">Todas</option><option value="in_person">Presencial</option><option value="virtual">Virtual</option><option value="hybrid">Híbrida</option></Select>
      </FormField>
      <FormField label="Categoría" name="categoria">
        <Select defaultValue={filters.category ?? ""} id="categoria" name="categoria"><option value="">Todas</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select>
      </FormField>
      <FormField label="Precio" name="precio">
        <Select defaultValue={filters.price ?? ""} id="precio" name="precio"><option value="">Todos</option><option value="free">Gratis</option><option value="paid">Con costo</option></Select>
      </FormField>
      <div className="flex items-end"><Button className="w-full" type="submit">Aplicar filtros</Button></div>
      <div className="lg:col-span-2"><FormField label="Desde la fecha" name="fecha"><Input defaultValue={filters.date} id="fecha" name="fecha" type="date" /></FormField></div>
    </form>
  );
}
