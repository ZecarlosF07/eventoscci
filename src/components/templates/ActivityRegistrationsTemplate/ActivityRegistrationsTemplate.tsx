import Link from "next/link";

import { OperationNotice } from "@/components/molecules/OperationNotice";
import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { ActivityRegistrationsTemplateProps } from "@/components/templates/ActivityRegistrationsTemplate/types/activity-registrations-template.types";
import { ROUTES } from "@/constants/routes";
import { ActivityParticipationMetrics } from "@/features/participation/components/ActivityParticipationMetrics/ActivityParticipationMetrics";
import { ParticipationActivityTabs } from "@/features/participation/components/ParticipationActivityTabs/ParticipationActivityTabs";
import { getActivityParticipationRoute } from "@/features/participation/utils/participation-routes";
import { ActivityRegistrationFilters } from "@/features/registrations/components/ActivityRegistrationFilters/ActivityRegistrationFilters";
import { RegistrationsTable } from "@/features/registrations/components/RegistrationsTable";
import { RegistrationStatusShortcuts } from "@/features/registrations/components/RegistrationStatusShortcuts/RegistrationStatusShortcuts";

export function ActivityRegistrationsTemplate({ activity, data, filters, result }: ActivityRegistrationsTemplateProps) {
  const pathname = getActivityParticipationRoute(activity.activityId);
  const statusValue = filters.status ?? filters.statusScope;
  const values = { estado: statusValue, q: filters.query, tipo: filters.registrationType };
  const query = new URLSearchParams(Object.entries(values).filter((item): item is [string, string] => Boolean(item[1]))).toString();
  const returnTo = query ? `${pathname}?${query}` : pathname;
  const exportValues = new URLSearchParams(query);
  exportValues.set("actividad", activity.activityId);

  return (
    <div className="space-y-7">
      <Link className="text-sm font-semibold text-slate-700 hover:underline" href={ROUTES.adminRegistrations}>← Volver a actividades</Link>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <SectionHeading description={`${data.total} inscripciones en la vista actual.`} eyebrow={activity.type === "event" ? "Evento" : "Capacitación"} title={activity.title} />
        <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold hover:bg-cci-50" href={`${ROUTES.adminRegistrations}/exportar?${exportValues}`}>Exportar CSV</Link>
      </div>
      <ParticipationActivityTabs activityId={activity.activityId} current="registrations" />
      <ActivityParticipationMetrics activity={activity} />
      <RegistrationStatusShortcuts activity={activity} filters={filters} />
      <OperationNotice result={result} />
      <ActivityRegistrationFilters filters={filters} />
      <RegistrationsTable registrations={data.registrations} returnTo={returnTo} />
      <Pagination page={data.page} pageCount={data.pageCount} pathname={pathname} searchParams={values} />
    </div>
  );
}
