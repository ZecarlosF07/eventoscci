import type { AttendanceActivityPageProps, AttendanceFilters, AttendanceStatus } from "@/features/attendance/types/attendance.types";
import type { RegistrationStatus, RegistrationType } from "@/features/registrations/types/registration.types";

export function firstValue(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function attendanceStatus(value?: string | string[]): AttendanceStatus | undefined {
  const status = firstValue(value);
  return status === "pending" || status === "attended" || status === "absent" ? status : undefined;
}

function registrationStatus(value?: string | string[]): RegistrationStatus | undefined {
  const status = firstValue(value);
  return status === "pending" || status === "confirmed" || status === "cancelled" ? status : undefined;
}

function registrationType(value?: string | string[]): RegistrationType | undefined {
  const type = firstValue(value);
  return type === "general" || type === "member" ? type : undefined;
}

export async function parseAttendanceFilters(
  searchParams: AttendanceActivityPageProps["searchParams"],
): Promise<AttendanceFilters> {
  const params = await searchParams;
  return {
    attendanceStatus: attendanceStatus(params.asistencia),
    query: firstValue(params.q)?.trim() || undefined,
    registrationStatus: registrationStatus(params.estado),
    registrationType: registrationType(params.tipo),
  };
}
