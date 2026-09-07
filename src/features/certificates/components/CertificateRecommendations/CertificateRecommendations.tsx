import Link from "next/link";

import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { ROUTES } from "@/constants/routes";
import { ActivityCard } from "@/features/activities/components/ActivityCard";
import type { CertificateRecommendationsProps } from "@/features/certificates/components/CertificateRecommendations/types/certificate-recommendations.types";
import { classNames } from "@/utils/class-names";

const CATALOG_LINKS = [
  { href: ROUTES.events, label: "Explorar eventos" },
  { href: ROUTES.trainings, label: "Ver capacitaciones" },
  { href: ROUTES.courses, label: "Descubrir cursos" },
];

export function CertificateRecommendations({ emphasized = false, recommendations }: CertificateRecommendationsProps) {
  if (emphasized && !recommendations.length) {
    return (
      <section aria-labelledby="certificate-recommendations-title" className="overflow-hidden rounded-[2rem] border border-cci-200 bg-cci-lime shadow-xl shadow-cci-950/10">
        <div className="grid lg:grid-cols-[1fr_22rem]">
          <div className="relative isolate overflow-hidden px-6 py-9 sm:px-10 sm:py-11">
            <span aria-hidden="true" className="absolute -bottom-32 -right-20 -z-10 size-72 rounded-full border border-cci-950/10" />
            <span aria-hidden="true" className="absolute -bottom-20 -right-8 -z-10 size-52 rounded-full border border-cci-950/10" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cci-800">Sigue creciendo</p>
            <Heading className="mt-3 max-w-2xl sm:text-4xl" id="certificate-recommendations-title" level={2}>Tu próximo logro puede empezar hoy</Heading>
            <Text className="mt-4 max-w-2xl text-cci-950/70">Explora nuevas experiencias para fortalecer tus capacidades, conectar y seguir avanzando profesionalmente.</Text>
          </div>
          <Link className="group flex min-h-48 flex-col justify-between bg-cci-950 p-7 text-white transition hover:bg-cci-800 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white sm:p-9 lg:min-h-full" href={ROUTES.home}>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cci-lime">Agenda CCI</span>
            <span className="mt-8 flex items-end justify-between gap-5 text-xl font-semibold leading-tight">
              Ver todas las oportunidades
              <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-cci-lime text-xl text-cci-950 transition group-hover:translate-x-1">→</span>
            </span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="certificate-recommendations-title" className={classNames(emphasized && "rounded-[2rem] border border-cci-100 bg-white p-6 shadow-sm sm:p-9")}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-600">Sigue creciendo</p>
      <Heading className="mt-2" id="certificate-recommendations-title" level={2}>Próximas oportunidades para ti</Heading>
      <Text className="mt-3">Descubre nuevos espacios de formación y conexión empresarial.</Text>
      {recommendations.length ? <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{recommendations.map((activity) => <ActivityCard activity={activity} key={activity.id} />)}</div> : null}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {CATALOG_LINKS.map((item, index) => <Link className={classNames("inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-800", emphasized && index === 0 ? "bg-cci-950 text-white hover:bg-cci-800" : "border border-cci-200 bg-white text-cci-950 hover:bg-cci-50")} href={item.href} key={item.href}>{item.label} <span aria-hidden="true" className="ml-2">→</span></Link>)}
      </div>
    </section>
  );
}
