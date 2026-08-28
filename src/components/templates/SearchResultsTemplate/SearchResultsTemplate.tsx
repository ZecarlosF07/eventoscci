import Link from "next/link";

import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { SearchResultsTemplateProps } from "@/components/templates/SearchResultsTemplate/types/search-results-template.types";
import { ActivityCard } from "@/features/activities/components/ActivityCard";
import { CourseCard } from "@/features/courses/components/CourseCard";

export function SearchResultsTemplate({ query, results }: SearchResultsTemplateProps) {
  const hasQuery = Boolean(query);

  return (
    <main className="mx-auto w-full max-w-[90rem] px-4 py-7 sm:px-6 sm:py-12 lg:px-8">
      <header className="overflow-hidden rounded-2xl bg-cci-950 px-5 py-8 text-white sm:rounded-[2rem] sm:px-10 sm:py-11">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cci-lime">Búsqueda general</p>
        <Heading className="mt-3 max-w-3xl text-white" level={1}>Encuentra actividades y cursos en un solo lugar</Heading>
        <Text className="mt-4 max-w-2xl text-white/70" size="lg">Busca simultáneamente en eventos, capacitaciones y cursos del Campus Virtual.</Text>
      </header>

      <form action="/buscar" className="relative -mt-5 mx-3 grid gap-3 rounded-2xl border border-cci-100 bg-white p-4 shadow-xl shadow-cci-950/8 sm:mx-6 sm:grid-cols-[1fr_auto] sm:p-5">
        <label className="sr-only" htmlFor="global-search">Buscar eventos, capacitaciones y cursos</label>
        <input autoFocus className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-cci-950 outline-none placeholder:text-slate-400 focus:border-cci-600 focus:ring-2 focus:ring-cci-100" defaultValue={query} id="global-search" name="q" placeholder="Ej. marketing, finanzas o transformación digital" required type="search" />
        <button className="min-h-12 rounded-xl bg-cci-950 px-6 text-sm font-bold text-white transition hover:bg-cci-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-950" type="submit">Buscar en todo</button>
      </form>

      {!hasQuery ? (
        <div className="mt-10 rounded-3xl border border-dashed border-cci-200 bg-white px-6 py-14 text-center">
          <Heading level={2}>¿Qué deseas encontrar?</Heading>
          <Text className="mt-2">Escribe un tema o título para buscar eventos, capacitaciones y cursos.</Text>
        </div>
      ) : results.total === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-cci-200 bg-white px-6 py-14 text-center">
          <Heading level={2}>No encontramos coincidencias</Heading>
          <Text className="mt-2">Prueba con un término más corto o con otra palabra relacionada.</Text>
        </div>
      ) : (
        <div className="mt-12 space-y-14">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-cci-100 pb-5">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-cci-600">Resultados</p>
              <Heading className="mt-1" level={2}>{results.total} {results.total === 1 ? "coincidencia" : "coincidencias"} para “{query}”</Heading>
            </div>
          </div>

          {results.events.length ? (
            <section aria-labelledby="search-events-title">
              <div className="flex items-center justify-between gap-4">
                <Heading id="search-events-title" level={2}>Eventos <span className="text-cci-500">({results.events.length})</span></Heading>
                <Link className="text-sm font-bold text-cci-800 underline decoration-cci-lime decoration-2 underline-offset-4" href={`/eventos?q=${encodeURIComponent(query)}`}>Ver catálogo</Link>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{results.events.map((activity) => <ActivityCard activity={activity} key={activity.id} />)}</div>
            </section>
          ) : null}

          {results.trainings.length ? (
            <section aria-labelledby="search-trainings-title">
              <div className="flex items-center justify-between gap-4">
                <Heading id="search-trainings-title" level={2}>Capacitaciones <span className="text-cci-500">({results.trainings.length})</span></Heading>
                <Link className="text-sm font-bold text-cci-800 underline decoration-cci-lime decoration-2 underline-offset-4" href={`/capacitaciones?q=${encodeURIComponent(query)}`}>Ver catálogo</Link>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{results.trainings.map((activity) => <ActivityCard activity={activity} key={activity.id} />)}</div>
            </section>
          ) : null}

          {results.courses.length ? (
            <section aria-labelledby="search-courses-title">
              <div className="flex items-center justify-between gap-4">
                <Heading id="search-courses-title" level={2}>Cursos <span className="text-cci-500">({results.courses.length})</span></Heading>
                <Link className="text-sm font-bold text-cci-800 underline decoration-cci-lime decoration-2 underline-offset-4" href={`/cursos?q=${encodeURIComponent(query)}`}>Ver catálogo</Link>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{results.courses.map((course) => <CourseCard course={course} key={course.id} />)}</div>
            </section>
          ) : null}
        </div>
      )}
    </main>
  );
}
