import { RegistrationsAdminTemplate } from "@/components/templates/RegistrationsAdminTemplate";
import { getConfirmedRegistrations } from "@/features/registrations/queries/get-activity-registrations";
import type { AdminRegistrationsPageProps } from "@/features/registrations/types/registration.types";
import { parseAdminRegistrationFilters } from "@/features/registrations/utils/admin-registration-filters";

export default async function ConfirmedRegistrationsPage({ searchParams }: AdminRegistrationsPageProps) {
  const filters = await parseAdminRegistrationFilters(searchParams, "confirmed");
  const data = await getConfirmedRegistrations({ activityId: filters.activityId, page: filters.page });
  return <RegistrationsAdminTemplate data={data} status="confirmed" title="Inscripciones confirmadas" />;
}
