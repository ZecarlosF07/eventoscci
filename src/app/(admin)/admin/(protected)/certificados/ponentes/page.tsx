import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { ROUTES } from "@/constants/routes";
import { FilterResults } from "@/features/admin-filters/components/FilterWorkspace";
import { CertificateActivityFilters } from "@/features/certificates/components/CertificateActivityFilters";
import { SpeakerCertificateActivityList } from "@/features/certificates/components/SpeakerCertificateActivityList";
import { getSpeakerCertificateActivities } from "@/features/certificates/queries/get-speaker-certificate-activities";
import type { SpeakerCertificatesPageProps } from "@/features/certificates/types/speaker-certificate.types";
import { parseCertificateActivityFilters } from "@/features/certificates/utils/certificate-admin-filters";

export default async function SpeakerCertificatesPage({ searchParams }: SpeakerCertificatesPageProps) {
  const filters = parseCertificateActivityFilters(await searchParams);
  const data = await getSpeakerCertificateActivities(filters);
  return <div className="space-y-7">
    <SectionHeading description={`${data.total} actividades con ponentes asignados. La emisión no requiere inscripción, asistencia ni pago.`} eyebrow="Reconocimiento institucional" title="Certificados de ponentes" />
    <CertificateActivityFilters filters={filters} total={data.total} />
    <FilterResults><SpeakerCertificateActivityList activities={data.activities} /></FilterResults>
    <Pagination page={data.page} pageCount={data.pageCount} pathname={ROUTES.adminCertificatesSpeakers} searchParams={{ q: filters.query, tipo: filters.type }} />
  </div>;
}
