import type {
  AdminRegistrationsPageProps,
  RegistrationAdminFilters,
  RegistrationStatus,
} from "@/features/registrations/types/registration.types";

function firstValue(value?: string | string[]): string | undefined {
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

export async function parseAdminRegistrationFilters(
  searchParams: AdminRegistrationsPageProps["searchParams"],
  fixedStatus?: RegistrationStatus,
): Promise<RegistrationAdminFilters> {
  const params = await searchParams;
  return {
    activityId: firstValue(params.actividad),
    page: parsePage(params.pagina),
    status: fixedStatus ?? parseStatus(params.estado),
  };
}
