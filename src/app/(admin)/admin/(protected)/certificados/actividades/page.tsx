import Link from "next/link";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { ROUTES } from "@/constants/routes";
import { CertificateActivityList } from "@/features/certificates/components/CertificateActivityList";
import { getCertificateActivities } from "@/features/certificates/queries/get-certificate-activities";

export default async function CertificateActivitiesPage() {
  const activities = await getCertificateActivities();
  return <div className="space-y-7"><div><Link className="text-sm font-semibold hover:underline" href={ROUTES.adminCertificates}>← Certificados</Link></div><SectionHeading description="Elige una actividad. Solo se habilitan inscripciones confirmadas que asistieron." eyebrow="Revisión administrativa" title="Certificados por actividad" /><CertificateActivityList activities={activities} /></div>;
}
