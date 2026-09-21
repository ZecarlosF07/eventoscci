import Link from "next/link";

import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { RegistrationSuggestionsTemplateProps } from "@/components/templates/RegistrationSuggestionsTemplate/types/registration-suggestions-template.types";
import { ROUTES } from "@/constants/routes";
import { RegistrationSuggestionFilters } from "@/features/registrations/components/RegistrationSuggestionFilters";
import { RegistrationSuggestionsTable } from "@/features/registrations/components/RegistrationSuggestionsTable";

export function RegistrationSuggestionsTemplate({ activities, data, filters }: RegistrationSuggestionsTemplateProps) {
  const query = new URLSearchParams();
  if (filters.activityId) query.set("actividad", filters.activityId);
  if (filters.activityType) query.set("tipo", filters.activityType);
  if (filters.audience !== "all") query.set("perfil", filters.audience);
  if (filters.query) query.set("q", filters.query);
  const searchParams = { actividad: filters.activityId, perfil: filters.audience === "all" ? undefined : filters.audience, q: filters.query, tipo: filters.activityType };

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="space-y-3"><Link className="text-sm font-semibold text-slate-700 hover:underline" href={ROUTES.adminRegistrations}>← Volver a Participación</Link><SectionHeading description={`${data.total} respuestas abiertas para orientar la programación de nuevas actividades.`} eyebrow="Escucha a tus participantes" title="Sugerencias" /></div>
        <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold hover:bg-cci-50" href={`${ROUTES.adminRegistrationSuggestions}/exportar?${query.toString()}`}>Exportar CSV</Link>
      </div>
      <RegistrationSuggestionFilters activities={activities} filters={filters} />
      <RegistrationSuggestionsTable items={data.items} />
      <Pagination page={data.page} pageCount={data.pageCount} pathname={ROUTES.adminRegistrationSuggestions} searchParams={searchParams} />
    </div>
  );
}
