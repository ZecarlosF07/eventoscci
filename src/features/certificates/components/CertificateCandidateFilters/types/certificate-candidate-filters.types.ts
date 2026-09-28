import type { CertificateCandidateFilters } from "@/features/certificates/types/certificate.types";

export interface CertificateCandidateFiltersProps { total?: number;
  filters: CertificateCandidateFilters;
}
