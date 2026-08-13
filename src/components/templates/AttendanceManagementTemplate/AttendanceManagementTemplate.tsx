import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { AttendanceManagementTemplateProps } from "@/components/templates/AttendanceManagementTemplate/types/attendance-management-template.types";
import { AttendanceActivityList } from "@/features/attendance/components/AttendanceActivityList";

export function AttendanceManagementTemplate({ activities }: AttendanceManagementTemplateProps) {
  return <div className="space-y-7"><SectionHeading description="Selecciona una actividad para registrar o corregir la asistencia general de sus participantes." eyebrow="Operación de actividades" title="Control de asistencia" /><AttendanceActivityList activities={activities} /></div>;
}
