import Link from "next/link";

import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { ParticipationOverviewTemplateProps } from "@/components/templates/ParticipationOverviewTemplate/types/participation-overview-template.types";
import { ROUTES } from "@/constants/routes";
import { ParticipationActivityGrid } from "@/features/participation/components/ParticipationActivityGrid/ParticipationActivityGrid";
import { ParticipationMetrics } from "@/features/participation/components/ParticipationMetrics/ParticipationMetrics";
import { ParticipationOverviewFilters } from "@/features/participation/components/ParticipationOverviewFilters/ParticipationOverviewFilters";

export function ParticipationOverviewTemplate({ data, filters, metrics }: ParticipationOverviewTemplateProps) {
  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <SectionHeading
          description="Elige una actividad para gestionar sus inscripciones y asistencia sin perder el contexto."
          eyebrow="Operación por actividad"
          title="Participación"
        />
        <Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-100 px-5 text-sm font-bold text-amber-900 hover:bg-amber-200" href={ROUTES.adminPendingPayments}>
          Pagos por verificar · {metrics.pending}
        </Link>
      </div>
      <ParticipationMetrics metrics={metrics} />
      <ParticipationOverviewFilters filters={filters} />
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-600">{data.total} actividades encontradas</p>
        <p className="text-xs text-slate-500">Las actividades con pendientes aparecen primero.</p>
      </div>
      <ParticipationActivityGrid activities={data.activities} />
      <Pagination
        page={data.page}
        pageCount={data.pageCount}
        pathname={ROUTES.adminRegistrations}
        searchParams={{ periodo: filters.period, q: filters.query, tipo: filters.activityType }}
      />
    </div>
  );
}
