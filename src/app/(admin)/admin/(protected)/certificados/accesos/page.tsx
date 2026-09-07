import { notFound } from "next/navigation";

import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { CertificateAccessLogsTable } from "@/features/certificates/components/CertificateAccessLogsTable";
import { getCertificateAccessLogs } from "@/features/certificates/queries/get-certificate-access-logs";
import type { CertificateAccessLogsPageProps } from "@/features/certificates/types/certificate-access.types";

function first(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CertificateAccessPage({ searchParams }: CertificateAccessLogsPageProps) {
  const account = await requireAdmin();
  if (account.role !== "administrator") notFound();
  const pageValue = Number(first((await searchParams).pagina));
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const data = await getCertificateAccessLogs(page);

  return (
    <div className="space-y-7">
      <SectionHeading description={`${data.total} aperturas y descargas registradas. Las aperturas repetidas durante 30 minutos se cuentan una sola vez.`} eyebrow="Auditoría" title="Accesos a certificados" />
      <CertificateAccessLogsTable items={data.items} />
      <Pagination page={data.page} pageCount={data.pageCount} pathname={ROUTES.adminCertificateAccess} />
    </div>
  );
}
