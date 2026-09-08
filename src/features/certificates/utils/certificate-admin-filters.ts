import type {
  CertificateActivityFilters,
  CertificateCandidateFilters,
} from "@/features/certificates/types/certificate.types";

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function positivePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function cleanQuery(value: string | undefined): string | undefined {
  const query = value?.trim().slice(0, 120);
  return query || undefined;
}

export function parseCertificateActivityFilters(
  params: Record<string, string | string[] | undefined>,
): CertificateActivityFilters {
  const type = firstValue(params.tipo);
  return {
    page: positivePage(firstValue(params.pagina)),
    query: cleanQuery(firstValue(params.q)),
    type: type === "event" || type === "training" ? type : undefined,
  };
}

export function parseCertificateCandidateFilters(
  params: Record<string, string | string[] | undefined>,
): CertificateCandidateFilters {
  return {
    page: positivePage(firstValue(params.pagina)),
    query: cleanQuery(firstValue(params.q)),
  };
}
