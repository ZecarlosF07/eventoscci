import Link from "next/link";

import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { ROUTES } from "@/constants/routes";
import { ActivityCard } from "@/features/activities/components/ActivityCard";
import type { CertificateRecommendationsProps } from "@/features/certificates/components/CertificateRecommendations/types/certificate-recommendations.types";

const CATALOG_LINKS = [
  { href: ROUTES.events, label: "Ver eventos" },
  { href: ROUTES.trainings, label: "Ver capacitaciones" },
  { href: ROUTES.courses, label: "Ver cursos" },
];

export function CertificateRecommendations({ recommendations }: CertificateRecommendationsProps) {
  return (
    <section aria-labelledby="certificate-recommendations-title">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-600">Sigue creciendo</p>
      <Heading className="mt-2" id="certificate-recommendations-title" level={2}>Próximas oportunidades para ti</Heading>
      <Text className="mt-3">Descubre nuevos espacios de formación y conexión empresarial.</Text>
      {recommendations.length ? <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{recommendations.map((activity) => <ActivityCard activity={activity} key={activity.id} />)}</div> : null}
      <div className="mt-7 flex flex-wrap gap-3">
        {CATALOG_LINKS.map((item) => <Link className="inline-flex min-h-11 items-center rounded-xl border border-cci-200 bg-white px-4 text-sm font-semibold text-cci-950 hover:bg-cci-50" href={item.href} key={item.href}>{item.label}</Link>)}
      </div>
    </section>
  );
}
