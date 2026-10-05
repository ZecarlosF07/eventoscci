import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Pagination } from "@/components/molecules/Pagination";
import { ROUTES } from "@/constants/routes";
import { ActivityCard } from "@/features/activities/components/ActivityCard";
import { ActivityFilters } from "@/features/activities/components/ActivityFilters";
import { getPublicEventPage } from "@/features/activities/queries/get-public-event-page";
import type { PublicCatalogPageProps } from "@/features/activities/types/activity-page.types";
import { hasPublicActivityFilters, parsePublicFilters } from "@/features/activities/types/activity-page.types";
import { getPublicActiveCategories } from "@/features/categories/queries/get-active-categories";
import { JsonLd } from "@/features/seo/components/JsonLd";
import { buildPageMetadata } from "@/features/seo/services/build-page-metadata";
import { buildBreadcrumbJsonLd } from "@/features/seo/utils/json-ld";
import { getSiteUrl } from "@/lib/env/server-env";

export async function generateMetadata({ searchParams }: PublicCatalogPageProps): Promise<Metadata> {
  const filters = parsePublicFilters(await searchParams);
  const filtered = hasPublicActivityFilters(filters);
  return buildPageMetadata({
    description: "Consulta los eventos realizados en Ica por la Cámara de Comercio: encuentros, conferencias, fechas, temas y programas de actividades anteriores.",
    follow: true,
    index: !filtered,
    path: !filtered && filters.page > 1 ? `${ROUTES.eventHistory}?pagina=${filters.page}` : ROUTES.eventHistory,
    title: filters.page > 1 ? `Eventos realizados en Ica — página ${filters.page}` : "Eventos realizados en Ica: historial de encuentros",
  });
}

export default async function EventHistoryPage({ searchParams }: PublicCatalogPageProps) {
  const filters = parsePublicFilters(await searchParams);
  const [result, categories] = await Promise.all([
    getPublicEventPage("past", filters), getPublicActiveCategories(),
  ]);
  if (result.page > result.pageCount) notFound();
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Inicio", path: ROUTES.home },
    { name: "Eventos", path: ROUTES.events },
    { name: "Eventos realizados", path: ROUTES.eventHistory },
  ], getSiteUrl());

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
      <JsonLd data={breadcrumbs} />
      <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-cci-800 hover:text-cci-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cci-800" href={ROUTES.events}><span aria-hidden="true">←</span> Volver a la agenda de eventos</Link>
      <header className="mb-8 mt-6 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-600">Cámara de Comercio de Ica</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-cci-950 sm:text-4xl">Eventos realizados en Ica</h1>
        <p className="mt-4 leading-7 text-slate-700">Explora los encuentros y conferencias de nuestra agenda anterior. Cada ficha conserva la descripción, las fechas y el programa publicado del evento. Las inscripciones de estas actividades han finalizado.</p>
      </header>
      <ActivityFilters categories={categories} filters={filters} />
      <section aria-labelledby="event-history-results" className="mt-10">
        <h2 className="text-2xl font-semibold text-cci-950" id="event-history-results">Encuentros anteriores</h2>
        <p className="mt-2 text-sm text-slate-600">{result.total} {result.total === 1 ? "evento realizado" : "eventos realizados"}, del más reciente al más antiguo.</p>
        {result.activities.length ? <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{result.activities.map((activity) => <ActivityCard activity={activity} key={activity.id} />)}</div> : <p className="mt-7 rounded-2xl border border-dashed border-cci-200 px-6 py-10 text-center text-slate-600">{hasPublicActivityFilters(filters) ? "No se encontraron eventos realizados con estos filtros." : "Los eventos aparecerán aquí cuando termine su última sesión."}</p>}
        {result.pageCount > 1 ? <div className="mt-9"><Pagination page={result.page} pageCount={result.pageCount} pathname={ROUTES.eventHistory} searchParams={{ categoria: filters.category, fecha: filters.date, modalidad: filters.modality, precio: filters.price, q: filters.query }} /></div> : null}
      </section>
    </div>
  );
}
