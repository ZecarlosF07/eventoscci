import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import type { RegistrationAdminFiltersProps } from "@/features/registrations/components/RegistrationAdminFilters/types/registration-admin-filters.types";

export function RegistrationAdminFilters({ activities, filters, showStatus }: RegistrationAdminFiltersProps) {
  return (
    <form className="grid gap-4 rounded-3xl border border-cci-100 bg-white p-5 lg:grid-cols-6">
      <div className="lg:col-span-2"><FormField label="Buscar participante" name="q"><Input defaultValue={filters.query} id="q" name="q" placeholder="Documento, nombre, correo o celular" type="search" /></FormField></div>
      <FormField label="Actividad" name="actividad"><Select defaultValue={filters.activityId ?? ""} id="actividad" name="actividad"><option value="">Todas</option>{activities.map((activity) => <option key={activity.id} value={activity.id}>{activity.title}</option>)}</Select></FormField>
      <FormField label="Tipo de actividad" name="tipo_actividad"><Select defaultValue={filters.activityType ?? ""} id="tipo_actividad" name="tipo_actividad"><option value="">Todos</option><option value="event">Evento</option><option value="training">Capacitación</option></Select></FormField>
      <FormField label="Tipo de inscripción" name="tipo"><Select defaultValue={filters.registrationType ?? ""} id="tipo" name="tipo"><option value="">Todos</option><option value="general">General</option><option value="member">Asociado</option></Select></FormField>
      {showStatus ? <FormField label="Estado" name="estado"><Select defaultValue={filters.status ?? ""} id="estado" name="estado"><option value="">Todos</option><option value="pending">Preinscrito</option><option value="confirmed">Confirmado</option><option value="cancelled">Cancelado</option></Select></FormField> : null}
      <FormField label="Asistencia" name="asistencia"><Select defaultValue={filters.attendanceStatus ?? ""} id="asistencia" name="asistencia"><option value="">Todas</option><option value="pending">Pendiente</option><option value="attended">Asistió</option><option value="absent">No asistió</option></Select></FormField>
      <div className="flex items-end"><Button className="w-full" type="submit">Aplicar filtros</Button></div>
    </form>
  );
}
