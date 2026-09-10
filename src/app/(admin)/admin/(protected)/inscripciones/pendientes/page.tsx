import { PendingPaymentsTemplate } from "@/components/templates/PendingPaymentsTemplate";
import { getPendingRegistrations, getRegistrationActivityOptions } from "@/features/registrations/queries/get-activity-registrations";
import type { AdminRegistrationsPageProps } from "@/features/registrations/types/registration.types";
import { firstValue, parseAdminRegistrationFilters } from "@/features/registrations/utils/admin-registration-filters";

export default async function PendingPaymentsPage({ searchParams }: AdminRegistrationsPageProps) {
  const filters = await parseAdminRegistrationFilters(searchParams, "pending");
  const [data, activities, params] = await Promise.all([
    getPendingRegistrations(filters),
    getRegistrationActivityOptions(),
    searchParams,
  ]);
  return <PendingPaymentsTemplate activities={activities} data={data} filters={filters} result={firstValue(params.resultado)} />;
}
