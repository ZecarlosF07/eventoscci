import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { ROUTES } from "@/constants/routes";
import { SpeakerCertificateTable } from "@/features/certificates/components/SpeakerCertificateTable";
import { getSpeakerCertificateData } from "@/features/certificates/queries/get-speaker-certificate-data";
import type { SpeakerCertificateDetailPageProps } from "@/features/certificates/types/speaker-certificate.types";

export default async function SpeakerCertificateDetailPage({ params }: SpeakerCertificateDetailPageProps) {
  const { activityId } = await params;
  const data = await getSpeakerCertificateData(activityId);
  if (!data) notFound();
  const issued = data.candidates.filter((candidate) => candidate.certificateId).length;
  return <div className="space-y-7">
    <Link className="text-sm font-semibold hover:underline" href={ROUTES.adminCertificatesSpeakers}>← Elegir otra actividad</Link>
    <SectionHeading description={`${data.candidates.length} ponentes asignados · ${issued} certificados emitidos. Puedes ajustar el rol antes de emitir.`} eyebrow={data.activity.type === "event" ? "Evento" : "Capacitación"} title={data.activity.title} />
    <SpeakerCertificateTable activityId={activityId} candidates={data.candidates} readOnly={data.activity.status === "archived"} templates={data.templates} />
  </div>;
}
