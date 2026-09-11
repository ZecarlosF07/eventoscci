import Link from "next/link";
import { notFound } from "next/navigation";

import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { ROUTES } from "@/constants/routes";
import { CertificateCandidateFilters } from "@/features/certificates/components/CertificateCandidateFilters";
import { CertificateCandidatesTable } from "@/features/certificates/components/CertificateCandidatesTable";
import { getActivityCertificateData } from "@/features/certificates/queries/get-activity-certificate-data";
import type { ActivityCertificatesPageProps } from "@/features/certificates/types/certificate.types";
import { parseCertificateCandidateFilters } from "@/features/certificates/utils/certificate-admin-filters";

export default async function ActivityCertificatesPage({ params, searchParams }: ActivityCertificatesPageProps) {
  const { activityId } = await params;
  const filters = parseCertificateCandidateFilters(await searchParams);
  const data = await getActivityCertificateData(activityId, filters);
  if (!data) notFound();
  return (
    <div className="space-y-7">
      <Link className="text-sm font-semibold hover:underline" href={ROUTES.adminCertificatesActivities}>← Elegir otra actividad</Link>
      <SectionHeading description={`${data.candidatePage.total} participantes. La base de datos vuelve a validar confirmación y asistencia al emitir.`} eyebrow={data.activity.type === "event" ? "Evento" : "Capacitación"} title={data.activity.title} />
      <CertificateCandidateFilters filters={filters} />
      <CertificateCandidatesTable activityId={data.activity.id} candidates={data.candidatePage.candidates} certificateMode={data.activity.certificate_mode} templates={data.templates} />
      <Pagination page={data.candidatePage.page} pageCount={data.candidatePage.pageCount} pathname={`${ROUTES.adminCertificatesActivities}/${activityId}`} searchParams={{ q: filters.query }} />
    </div>
  );
}
