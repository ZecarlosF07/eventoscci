import { RegistrationsAdminTemplate } from "@/components/templates/RegistrationsAdminTemplate";
import { getActivityRegistrations } from "@/features/registrations/queries/get-activity-registrations";
import type { AdminRegistrationsPageProps } from "@/features/registrations/types/registration.types";
import { parseAdminRegistrationFilters } from "@/features/registrations/utils/admin-registration-filters";

export default async function AdminRegistrationsPage({ searchParams }: AdminRegistrationsPageProps) {
  const filters = await parseAdminRegistrationFilters(searchParams);
  const data = await getActivityRegistrations(filters);
  return <RegistrationsAdminTemplate data={data} status={filters.status} title="Inscripciones" />;
}
