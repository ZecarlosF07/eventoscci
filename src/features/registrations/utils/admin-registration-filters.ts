import type {
  AdminRegistrationsPageProps,
  RegistrationAdminFilters,
  RegistrationStatus,
} from "@/features/registrations/types/registration.types";
import type { ActivityType } from "@/features/activities/types/activity.types";
import type { AttendanceStatus } from "@/features/attendance/types/attendance.types";
import type { RegistrationType } from "@/features/registrations/types/registration.types";

export function firstValue(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value?: string | string[]): number {
  const page = Number(firstValue(value));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseStatus(value?: string | string[]): RegistrationStatus | undefined {
  const status = firstValue(value);
  return status === "pending" || status === "confirmed" || status === "cancelled"
    ? status
    : undefined;
}

function parseActivityType(value?: string | string[]): ActivityType | undefined {
  const type = firstValue(value);
  return type === "event" || type === "training" ? type : undefined;
}

function parseAttendanceStatus(value?: string | string[]): AttendanceStatus | undefined {
  const status = firstValue(value);
  return status === "pending" || status === "attended" || status === "absent"
    ? status
    : undefined;
}

function parseRegistrationType(value?: string | string[]): RegistrationType | undefined {
  const type = firstValue(value);
  return type === "general" || type === "member" ? type : undefined;
}

export async function parseAdminRegistrationFilters(
  searchParams: AdminRegistrationsPageProps["searchParams"],
  fixedStatus?: RegistrationStatus,
): Promise<RegistrationAdminFilters> {
  const params = await searchParams;
  return {
    activityId: firstValue(params.actividad),
    activityType: parseActivityType(params.tipo_actividad),
    attendanceStatus: parseAttendanceStatus(params.asistencia),
    page: parsePage(params.pagina),
    query: firstValue(params.q)?.trim() || undefined,
    registrationType: parseRegistrationType(params.tipo),
    status: fixedStatus ?? parseStatus(params.estado),
  };
}
