import Link from "next/link";

import { OperationNotice } from "@/components/molecules/OperationNotice";
import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { ROUTES } from "@/constants/routes";
import { PendingRegistrationFilters } from "@/features/registrations/components/PendingRegistrationFilters/PendingRegistrationFilters";
import { RegistrationsTable } from "@/features/registrations/components/RegistrationsTable";
import type { RegistrationActivityOption, RegistrationAdminFilters, RegistrationAdminPage } from "@/features/registrations/types/registration.types";

interface Props {
  activities: RegistrationActivityOption[];
  data: RegistrationAdminPage;
  filters: RegistrationAdminFilters;
  result?: string;
}

export function PendingPaymentsTemplate({ activities, data, filters, result }: Props) {
  const values = { actividad: filters.activityId, q: filters.query, tipo: filters.registrationType };
  const query = new URLSearchParams(Object.entries(values).filter((item): item is [string, string] => Boolean(item[1]))).toString();
  const returnTo = query ? `${ROUTES.adminPendingPayments}?${query}` : ROUTES.adminPendingPayments;
  return (
    <div className="space-y-7">
      <Link className="text-sm font-semibold text-slate-700 hover:underline" href={ROUTES.adminRegistrations}>← Volver a Participación</Link>
      <SectionHeading description={`${data.total} inscripciones pagadas pendientes de validación.`} eyebrow="Cola de trabajo" title="Pagos por verificar" />
      <OperationNotice result={result} />
      <PendingRegistrationFilters activities={activities} filters={filters} />
      <RegistrationsTable registrations={data.registrations} returnTo={returnTo} showActivity />
      <Pagination page={data.page} pageCount={data.pageCount} pathname={ROUTES.adminPendingPayments} searchParams={values} />
    </div>
  );
}
