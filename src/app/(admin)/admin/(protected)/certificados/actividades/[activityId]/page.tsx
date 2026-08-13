import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { ROUTES } from "@/constants/routes";
import { CertificateCandidatesTable } from "@/features/certificates/components/CertificateCandidatesTable";
import { getActivityCertificateData } from "@/features/certificates/queries/get-activity-certificate-data";
import type { ActivityCertificatesPageProps } from "@/features/certificates/types/certificate.types";

export default async function ActivityCertificatesPage({ params }: ActivityCertificatesPageProps) {
  const { activityId } = await params;
  const data = await getActivityCertificateData(activityId);
  if (!data) notFound();
  return <div className="space-y-7"><Link className="text-sm font-semibold hover:underline" href={ROUTES.adminCertificatesActivities}>← Elegir otra actividad</Link><SectionHeading description="La base de datos vuelve a validar confirmación y asistencia al emitir." eyebrow={data.activity.type === "event" ? "Evento" : "Capacitación"} title={data.activity.title} /><CertificateCandidatesTable activityId={data.activity.id} candidates={data.candidates} templates={data.templates} /></div>;
}
