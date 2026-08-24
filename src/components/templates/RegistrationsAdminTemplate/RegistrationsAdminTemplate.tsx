import Link from "next/link";

import { OperationNotice } from "@/components/molecules/OperationNotice";
import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { RegistrationsAdminTemplateProps } from "@/components/templates/RegistrationsAdminTemplate/types/registrations-admin-template.types";
import { ROUTES } from "@/constants/routes";
import { RegistrationsTable } from "@/features/registrations/components/RegistrationsTable";
import { RegistrationAdminFilters } from "@/features/registrations/components/RegistrationAdminFilters";

const FILTER_LINKS = [
  [ROUTES.adminRegistrations, "Todas"],
  [ROUTES.adminPendingRegistrations, "Preinscritos"],
  [ROUTES.adminConfirmedRegistrations, "Confirmados"],
] as const;

export function RegistrationsAdminTemplate({ activities, data, filters, result, status, title }: RegistrationsAdminTemplateProps) {
  const baseRoute = status === "pending"
    ? ROUTES.adminPendingRegistrations
    : status === "confirmed"
      ? ROUTES.adminConfirmedRegistrations
      : ROUTES.adminRegistrations;
  const queryValues = {
    actividad: filters.activityId,
    asistencia: filters.attendanceStatus,
    estado: status ? undefined : filters.status,
    q: filters.query,
    tipo: filters.registrationType,
    tipo_actividad: filters.activityType,
  };
  const query = new URLSearchParams(Object.entries(queryValues).filter((item): item is [string, string] => Boolean(item[1]))).toString();
  const exportValues = { ...queryValues, estado: status ?? filters.status };
  const exportQuery = new URLSearchParams(Object.entries(exportValues).filter((item): item is [string, string] => Boolean(item[1]))).toString();
  const returnTo = query ? `${baseRoute}?${query}` : baseRoute;

  return (
    <div className="space-y-7">
      <SectionHeading
        description={`${data.total} inscripciones activas encontradas.`}
        eyebrow="Participación en actividades"
        title={title}
      />
      <OperationNotice result={result} />
      <nav aria-label="Filtros de inscripciones" className="flex flex-wrap gap-2">
        {FILTER_LINKS.map(([href, label]) => (
          <Link className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-cci-50" href={href} key={href}>{label}</Link>
        ))}
      </nav>
      <RegistrationAdminFilters activities={activities} filters={filters} showStatus={!status} />
      <div className="flex justify-end"><Link className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-cci-50" href={`${ROUTES.adminRegistrations}/exportar${exportQuery ? `?${exportQuery}` : ""}`}>Exportar CSV</Link></div>
      <RegistrationsTable registrations={data.registrations} returnTo={returnTo} />
      <Pagination page={data.page} pageCount={data.pageCount} pathname={baseRoute} searchParams={queryValues} />
    </div>
  );
}
