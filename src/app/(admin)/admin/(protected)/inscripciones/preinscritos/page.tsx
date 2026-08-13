import { RegistrationsAdminTemplate } from "@/components/templates/RegistrationsAdminTemplate";
import { getPendingRegistrations, getRegistrationActivityOptions } from "@/features/registrations/queries/get-activity-registrations";
import type { AdminRegistrationsPageProps } from "@/features/registrations/types/registration.types";
import { firstValue, parseAdminRegistrationFilters } from "@/features/registrations/utils/admin-registration-filters";

export default async function PendingRegistrationsPage({ searchParams }: AdminRegistrationsPageProps) {
  const filters = await parseAdminRegistrationFilters(searchParams, "pending");
  const queryFilters = {
    activityId: filters.activityId,
    activityType: filters.activityType,
    attendanceStatus: filters.attendanceStatus,
    page: filters.page,
    query: filters.query,
    registrationType: filters.registrationType,
  };
  const [data, activities, params] = await Promise.all([
    getPendingRegistrations(queryFilters),
    getRegistrationActivityOptions(),
    searchParams,
  ]);
  return <RegistrationsAdminTemplate activities={activities} data={data} filters={filters} result={firstValue(params.resultado)} status="pending" title="Preinscritos" />;
}
