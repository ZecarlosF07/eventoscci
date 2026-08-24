import Link from "next/link";

import { Text } from "@/components/atoms/Text";
import { ROUTES } from "@/constants/routes";
import type { CertificateActivityListProps } from "@/features/certificates/components/CertificateActivityList/types/certificate-activity-list.types";

export function CertificateActivityList({ activities }: CertificateActivityListProps) {
  if (!activities.length) return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><Text>No hay actividades disponibles.</Text></div>;
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{activities.map((activity) => (
    <article className="flex flex-col justify-between gap-5 rounded-3xl border border-cci-100 bg-white p-6" key={activity.id}>
      <div className="space-y-2"><Text className="font-semibold uppercase tracking-wide" size="sm">{activity.type === "event" ? "Evento" : "Capacitación"}</Text><h2 className="text-lg font-semibold text-cci-950">{activity.title}</h2><Text>{activity.eligibleCount} elegibles · {activity.issuedCount} emitidos</Text></div>
      <Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cci-950 px-4 text-sm font-semibold text-white" href={`${ROUTES.adminCertificatesActivities}/${activity.id}`}>Gestionar certificados</Link>
    </article>
  ))}</div>;
}
