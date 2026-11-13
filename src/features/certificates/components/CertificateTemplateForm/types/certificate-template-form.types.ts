import type { CertificateSigner, CertificateTemplate } from "@/features/certificates/types/certificate.types";

export interface CertificateTemplateFormProps { template?: CertificateTemplate }
export interface CertificateSignerRow { key: string; signer?: CertificateSigner }

export interface CertificateSignerFieldsProps {
  signer?: CertificateSigner;
  index: number;
  count: number;
  errors?: Record<string, string[]>;
  move: (from: number, to: number) => void;
  remove: () => void;
}
