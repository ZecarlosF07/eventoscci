import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { ROUTES } from "@/constants/routes";
import { CertificateActivityFilters } from "@/features/certificates/components/CertificateActivityFilters";
import { CertificateActivityList } from "@/features/certificates/components/CertificateActivityList";
import { getCertificateActivities } from "@/features/certificates/queries/get-certificate-activities";
import type { CertificateActivitiesPageProps } from "@/features/certificates/types/certificate.types";
import { parseCertificateActivityFilters } from "@/features/certificates/utils/certificate-admin-filters";

export default async function CertificateActivitiesPage({ searchParams }: CertificateActivitiesPageProps) {
  const filters = parseCertificateActivityFilters(await searchParams);
  const data = await getCertificateActivities(filters);
  return (
    <div className="space-y-7">
      <SectionHeading description={`${data.total} actividades disponibles. Solo se habilitan inscripciones confirmadas que asistieron.`} eyebrow="Revisión administrativa" title="Certificados por actividad" />
      <CertificateActivityFilters filters={filters} />
      <CertificateActivityList activities={data.activities} />
      <Pagination page={data.page} pageCount={data.pageCount} pathname={ROUTES.adminCertificatesActivities} searchParams={{ q: filters.query, tipo: filters.type }} />
    </div>
  );
}
