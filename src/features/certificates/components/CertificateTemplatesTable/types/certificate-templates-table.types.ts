import type { CertificateTemplate } from "@/features/certificates/types/certificate.types";

export interface CertificateTemplatesTableProps { canManage: boolean; templates: CertificateTemplate[] }
export interface RetireCertificateModelProps { id: string; name: string }
