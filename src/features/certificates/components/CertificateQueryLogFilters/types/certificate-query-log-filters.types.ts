import type { CertificateQueryLogFilters } from "@/features/certificates/types/certificate.types";

export interface CertificateQueryLogFiltersProps { total?: number;
  filters: CertificateQueryLogFilters;
}
