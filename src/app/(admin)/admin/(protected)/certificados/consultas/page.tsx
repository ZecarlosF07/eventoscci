import { notFound } from "next/navigation";

import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { CertificateQueryLogFilters } from "@/features/certificates/components/CertificateQueryLogFilters";
import { CertificateQueryLogsTable } from "@/features/certificates/components/CertificateQueryLogsTable";
import { getCertificateQueryLogs } from "@/features/certificates/queries/get-certificate-query-logs";
import type { CertificateQueryLogFilters as QueryFilters, CertificateQueryLogsPageProps } from "@/features/certificates/types/certificate.types";

function first(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function validDate(value?: string): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  return Number.isNaN(Date.parse(`${value}T12:00:00Z`)) ? undefined : value;
}

function parseFilters(params: Awaited<CertificateQueryLogsPageProps["searchParams"]>): QueryFilters {
  const pageValue = Number(first(params.pagina));
  const outcome = first(params.resultado);
  const validOutcomes = ["found", "invalid", "not_found", "rate_limited"] as const;
  return {
    dateFrom: validDate(first(params.desde)),
    dateTo: validDate(first(params.hasta)),
    documentNumber: first(params.dni)?.trim(),
    outcome: validOutcomes.find((item) => item === outcome),
    page: Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1,
  };
}

export default async function CertificateQueriesPage({ searchParams }: CertificateQueryLogsPageProps) {
  const account = await requireAdmin();
  if (account.role !== "administrator") notFound();
  const filters = parseFilters(await searchParams);
  const data = await getCertificateQueryLogs(filters);
  return (
    <div className="space-y-7">
      <SectionHeading description={`${data.total} consultas registradas. Solo los administradores pueden acceder a esta bitácora.`} eyebrow="Auditoría" title="Consultas públicas de certificados" />
      <CertificateQueryLogFilters filters={filters} />
      <CertificateQueryLogsTable items={data.items} />
      <Pagination page={data.page} pageCount={data.pageCount} pathname={ROUTES.adminCertificateQueries} searchParams={{ desde: filters.dateFrom, dni: filters.documentNumber, hasta: filters.dateTo, resultado: filters.outcome }} />
    </div>
  );
}
