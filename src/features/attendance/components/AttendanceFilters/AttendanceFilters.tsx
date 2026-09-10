import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import type { AttendanceFiltersProps } from "@/features/attendance/components/AttendanceFilters/types/attendance-filters.types";

export function AttendanceFilters({ filters }: AttendanceFiltersProps) {
  return (
    <form className="grid gap-4 rounded-3xl border border-cci-100 bg-white p-5 lg:grid-cols-5">
      <div className="lg:col-span-2"><FormField label="Buscar participante" name="q"><Input defaultValue={filters.query} id="q" name="q" placeholder="Documento, nombre o correo" type="search" /></FormField></div>
      <FormField label="Inscripción" name="estado"><Select defaultValue={filters.registrationStatus ?? "all"} id="estado" name="estado"><option value="confirmed">Confirmadas (operables)</option><option value="all">Todas (consulta)</option><option value="pending">Por verificar</option><option value="cancelled">Canceladas</option></Select></FormField>
      <FormField label="Tipo" name="tipo"><Select defaultValue={filters.registrationType ?? ""} id="tipo" name="tipo"><option value="">Todos</option><option value="general">General</option><option value="member">Asociado</option></Select></FormField>
      <FormField label="Asistencia" name="asistencia"><Select defaultValue={filters.attendanceStatus ?? ""} id="asistencia" name="asistencia"><option value="">Todas</option><option value="pending">Pendiente</option><option value="attended">Asistió</option><option value="absent">No asistió</option></Select></FormField>
      <div className="lg:col-span-5 flex justify-end"><Button type="submit">Aplicar filtros</Button></div>
    </form>
  );
}
