import Link from "next/link";

import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { ROUTES } from "@/constants/routes";
import type { RegistrationSuggestionFiltersProps } from "@/features/registrations/components/RegistrationSuggestionFilters/types/registration-suggestion-filters.types";

export function RegistrationSuggestionFilters({ activities, filters }: RegistrationSuggestionFiltersProps) {
  return (
    <form className="grid gap-3 rounded-2xl border border-cci-100 bg-white p-4 lg:grid-cols-[minmax(200px,1fr)_minmax(220px,1fr)_170px_190px_auto_auto]" method="get">
      <Input defaultValue={filters.query} name="q" placeholder="Buscar en sugerencias" type="search" />
      <Select aria-label="Actividad" defaultValue={filters.activityId ?? ""} name="actividad">
        <option value="">Todas las actividades</option>
        {activities.map((activity) => <option key={activity.id} value={activity.id}>{activity.title}</option>)}
      </Select>
      <Select aria-label="Tipo de actividad" defaultValue={filters.activityType ?? ""} name="tipo">
        <option value="">Eventos y capacitaciones</option>
        <option value="event">Eventos</option>
        <option value="training">Capacitaciones</option>
      </Select>
      <Select aria-label="Perfil" defaultValue={filters.audience} name="perfil">
        <option value="all">Todos los perfiles</option>
        <option value="professional">Profesionales</option>
        <option value="student">Estudiantes</option>
        <option value="member">Asociados CCI</option>
      </Select>
      <button className="min-h-11 rounded-xl bg-cci-950 px-5 text-sm font-bold text-white hover:bg-cci-800" type="submit">Aplicar</button>
      <Link className="flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold hover:bg-cci-50" href={ROUTES.adminRegistrationSuggestions}>Limpiar</Link>
    </form>
  );
}
