import { RegistrationsAdminTemplate } from "@/components/templates/RegistrationsAdminTemplate";
import { getPendingRegistrations } from "@/features/registrations/queries/get-activity-registrations";
import type { AdminRegistrationsPageProps } from "@/features/registrations/types/registration.types";
import { parseAdminRegistrationFilters } from "@/features/registrations/utils/admin-registration-filters";

export default async function PendingRegistrationsPage({ searchParams }: AdminRegistrationsPageProps) {
  const filters = await parseAdminRegistrationFilters(searchParams, "pending");
  const data = await getPendingRegistrations({ activityId: filters.activityId, page: filters.page });
  return <RegistrationsAdminTemplate data={data} status="pending" title="Preinscritos" />;
}
