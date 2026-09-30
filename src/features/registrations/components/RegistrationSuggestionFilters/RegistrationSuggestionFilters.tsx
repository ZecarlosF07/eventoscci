import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { AutoFilterForm } from "@/features/admin-filters/components/AutoFilterForm";
import type { RegistrationSuggestionFiltersProps } from "@/features/registrations/components/RegistrationSuggestionFilters/types/registration-suggestion-filters.types";
import { PARTICIPANT_PROFILE_LABELS } from "@/features/registrations/constants/registration.constants";

export function RegistrationSuggestionFilters({ activities, filters, total }: RegistrationSuggestionFiltersProps) {
  return (
    <AutoFilterForm total={total} valueLabels={Object.fromEntries(activities.map((activity) => [activity.id, activity.title]))} className="lg:grid-cols-[minmax(200px,1fr)_minmax(220px,1fr)_170px_190px]" defaults={{ perfil: "all" }}>
      <Input defaultValue={filters.query} name="q" aria-label="Buscar en sugerencias" placeholder="Buscar en sugerencias" type="search" />
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
        <option value="professional">{PARTICIPANT_PROFILE_LABELS.professional}</option>
        <option value="student">Estudiantes</option>
        <option value="member">Asociados CCI</option>
      </Select>
    </AutoFilterForm>
  );
}
