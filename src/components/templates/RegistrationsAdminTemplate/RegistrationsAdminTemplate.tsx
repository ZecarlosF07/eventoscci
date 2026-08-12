import Link from "next/link";

import { Text } from "@/components/atoms/Text";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { RegistrationsAdminTemplateProps } from "@/components/templates/RegistrationsAdminTemplate/types/registrations-admin-template.types";
import { ROUTES } from "@/constants/routes";
import { RegistrationsTable } from "@/features/registrations/components/RegistrationsTable";

const FILTER_LINKS = [
  [ROUTES.adminRegistrations, "Todas"],
  [ROUTES.adminPendingRegistrations, "Preinscritos"],
  [ROUTES.adminConfirmedRegistrations, "Confirmados"],
] as const;

export function RegistrationsAdminTemplate({ data, status, title }: RegistrationsAdminTemplateProps) {
  const baseRoute = status === "pending"
    ? ROUTES.adminPendingRegistrations
    : status === "confirmed"
      ? ROUTES.adminConfirmedRegistrations
      : ROUTES.adminRegistrations;

  return (
    <div className="space-y-7">
      <SectionHeading
        description={`${data.total} inscripciones activas encontradas.`}
        eyebrow="Participación en actividades"
        title={title}
      />
      <nav aria-label="Filtros de inscripciones" className="flex flex-wrap gap-2">
        {FILTER_LINKS.map(([href, label]) => (
          <Link className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50" href={href} key={href}>{label}</Link>
        ))}
      </nav>
      <RegistrationsTable registrations={data.registrations} />
      <div className="flex items-center justify-between">
        <Text size="sm">Página {data.page} de {data.pageCount}</Text>
        <div className="flex gap-2">
          {data.page > 1 ? <Link className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold" href={`${baseRoute}?pagina=${data.page - 1}`}>Anterior</Link> : null}
          {data.page < data.pageCount ? <Link className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold" href={`${baseRoute}?pagina=${data.page + 1}`}>Siguiente</Link> : null}
        </div>
      </div>
    </div>
  );
}
