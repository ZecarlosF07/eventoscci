import type { CertificateActivityFilters } from "@/features/certificates/types/certificate.types";

export interface CertificateActivityFiltersProps { total?: number;
  filters: CertificateActivityFilters;
}
