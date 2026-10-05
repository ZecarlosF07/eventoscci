import Link from "next/link";

import { ROUTES } from "@/constants/routes";

export function HomeIntroduction() {
  return (
    <section className="mx-auto max-w-[90rem] px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-600">Cámara de Comercio de Ica</p>
      <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-cci-950 sm:text-4xl [text-wrap:balance]">Eventos, capacitaciones y cursos en Ica, Perú</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">Encuentra espacios para conectar con la comunidad empresarial, aprender y fortalecer tus capacidades. Consulta la agenda de la Cámara de Comercio de Ica y revisa las fechas, modalidades y requisitos de participación de cada actividad.</p>
      <nav aria-label="Explorar la oferta de la Cámara" className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
        <Link className="inline-flex min-h-11 items-center rounded-lg font-semibold text-cci-800 underline decoration-cci-200 underline-offset-4 hover:text-cci-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cci-800" href={ROUTES.events}>Eventos en Ica</Link>
        <Link className="inline-flex min-h-11 items-center rounded-lg font-semibold text-cci-800 underline decoration-cci-200 underline-offset-4 hover:text-cci-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cci-800" href={ROUTES.trainings}>Capacitaciones</Link>
        <Link className="inline-flex min-h-11 items-center rounded-lg font-semibold text-cci-800 underline decoration-cci-200 underline-offset-4 hover:text-cci-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cci-800" href={ROUTES.courses}>Cursos virtuales</Link>
      </nav>
    </section>
  );
}
