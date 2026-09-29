import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import { AutoFilterForm } from "@/features/admin-filters/components/AutoFilterForm";
import type { AttendanceFiltersProps } from "@/features/attendance/components/AttendanceFilters/types/attendance-filters.types";

export function AttendanceFilters({ filters, total }: AttendanceFiltersProps) {
  const secondary = <>
    <FormField label="Inscripción" name="estado"><Select defaultValue={filters.registrationStatus ?? "all"} id="estado" name="estado"><option value="confirmed">Confirmadas (operables)</option><option value="all">Todas (consulta)</option><option value="pending">Pendientes de confirmación</option><option value="cancelled">Canceladas</option></Select></FormField>
    <FormField label="Tipo de participante" name="tipo"><Select defaultValue={filters.registrationType ?? ""} id="tipo" name="tipo"><option value="">Todos</option><option value="general">General</option><option value="member">Asociado</option></Select></FormField>
  </>;
  return (
    <AutoFilterForm total={total} className="sm:grid-cols-[minmax(0,1fr)_220px]" defaults={{ estado: "confirmed" }}
      moreFilters={{ names: ["estado", "tipo"], children: secondary }} valueLabels={{ attended: "Asistieron", absent: "No asistieron", all: "Todas (consulta)" }}>
      <Input aria-label="Buscar participante" defaultValue={filters.query} id="q" name="q" placeholder="Nombre, documento, correo, celular o código" type="search" />
      <Select aria-label="Filtrar por asistencia" defaultValue={filters.attendanceStatus ?? ""} id="asistencia" name="asistencia"><option value="">Toda la asistencia</option><option value="pending">Sin marcar</option><option value="attended">Asistieron</option><option value="absent">No asistieron</option></Select>
    </AutoFilterForm>
  );
}
