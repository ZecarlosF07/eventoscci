import Link from "next/link";

import { Text } from "@/components/atoms/Text";
import { ROUTES } from "@/constants/routes";
import type { SpeakerCertificateActivityListProps } from "@/features/certificates/types/speaker-certificate.types";

export function SpeakerCertificateActivityList({ activities }: SpeakerCertificateActivityListProps) {
  if (!activities.length) {
    return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><Text>No hay actividades con ponentes asignados.</Text></div>;
  }
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{activities.map((activity) => {
    const pending = activity.pendingCount;
    return <article className="flex flex-col justify-between gap-5 rounded-3xl border border-cci-100 bg-white p-6" key={activity.id}>
      <div className="space-y-2">
        <Text className="font-semibold uppercase tracking-wide" size="sm">{activity.type === "event" ? "Evento" : "Capacitación"}</Text>
        <h2 className="text-lg font-semibold text-cci-950">{activity.title}</h2>
        <Text>{activity.speakerCount} ponentes · {activity.issuedCount} emitidos · {pending} pendientes</Text>
      </div>
      <Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cci-950 px-4 text-sm font-semibold text-white" href={`${ROUTES.adminCertificatesSpeakers}/${activity.id}`}>Gestionar certificados</Link>
    </article>;
  })}</div>;
}
