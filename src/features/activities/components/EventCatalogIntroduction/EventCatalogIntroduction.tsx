import Link from "next/link";

import { ROUTES } from "@/constants/routes";

export function EventCatalogIntroduction() {
  return (
    <section aria-labelledby="event-agenda-introduction" className="mt-10 max-w-3xl">
      <h2 className="text-2xl font-semibold tracking-tight text-cci-950" id="event-agenda-introduction">Consulta la agenda de eventos en Ica</h2>
      <p className="mt-3 leading-7 text-slate-700">Conoce los encuentros, conferencias y espacios de intercambio de la Cámara de Comercio de Ica. En cada evento encontrarás su descripción, fechas, modalidad, lugar y requisitos para participar.</p>
      <p className="mt-3 leading-7 text-slate-700">Abre la ficha del encuentro que te interesa y revisa si está dirigido al público general o a empresas asociadas. Desde allí podrás acceder a la inscripción cuando esté disponible.</p>
      <p className="mt-3 leading-7 text-slate-700">También puedes consultar nuestros <Link className="rounded font-semibold text-cci-800 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cci-800" href={ROUTES.eventHistory}>eventos realizados</Link> para conocer las actividades anteriores.</p>
    </section>
  );
}
