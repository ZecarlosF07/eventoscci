import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import { AutoFilterForm } from "@/features/admin-filters/components/AutoFilterForm";
import type { AttendanceFiltersProps } from "@/features/attendance/components/AttendanceFilters/types/attendance-filters.types";

export function AttendanceFilters({ filters, total }: AttendanceFiltersProps) {
  return (
    <AutoFilterForm total={total} className="lg:grid-cols-5" defaults={{ estado: "confirmed" }}>
      <div className="lg:col-span-2"><FormField label="Buscar participante" name="q"><Input defaultValue={filters.query} id="q" name="q" placeholder="Nombre, documento, correo, celular o código" type="search" /></FormField></div>
      <FormField label="Inscripción" name="estado"><Select defaultValue={filters.registrationStatus ?? "all"} id="estado" name="estado"><option value="confirmed">Confirmadas (operables)</option><option value="all">Todas (consulta)</option><option value="pending">Pendientes de confirmación</option><option value="cancelled">Canceladas</option></Select></FormField>
      <FormField label="Tipo" name="tipo"><Select defaultValue={filters.registrationType ?? ""} id="tipo" name="tipo"><option value="">Todos</option><option value="general">General</option><option value="member">Asociado</option></Select></FormField>
      <FormField label="Asistencia" name="asistencia"><Select defaultValue={filters.attendanceStatus ?? ""} id="asistencia" name="asistencia"><option value="">Todas</option><option value="pending">Pendiente</option><option value="attended">Asistió</option><option value="absent">No asistió</option></Select></FormField>
    </AutoFilterForm>
  );
}
