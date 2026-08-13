import { RegistrationsAdminTemplate } from "@/components/templates/RegistrationsAdminTemplate";
import { getActivityRegistrations, getRegistrationActivityOptions } from "@/features/registrations/queries/get-activity-registrations";
import type { AdminRegistrationsPageProps } from "@/features/registrations/types/registration.types";
import { firstValue, parseAdminRegistrationFilters } from "@/features/registrations/utils/admin-registration-filters";

export default async function AdminRegistrationsPage({ searchParams }: AdminRegistrationsPageProps) {
  const filters = await parseAdminRegistrationFilters(searchParams);
  const [data, activities, params] = await Promise.all([
    getActivityRegistrations(filters),
    getRegistrationActivityOptions(),
    searchParams,
  ]);
  return <RegistrationsAdminTemplate activities={activities} data={data} filters={filters} result={firstValue(params.resultado)} title="Inscripciones" />;
}
