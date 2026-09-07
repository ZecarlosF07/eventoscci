export type CertificatePublicAccessAction = "certificate.public_download" | "certificate.public_view";
export type CertificatePublicAccessSource = "direct" | "email" | "public_search";

export interface CertificatePublicAccessInput {
  action: CertificatePublicAccessAction;
  ipAddress: string | null;
  source: CertificatePublicAccessSource;
  token: string;
  userAgent: string | null;
}

export interface CertificateAccessLogItem {
  action: CertificatePublicAccessAction;
  certificateCode: string;
  certificateTitle: string;
  createdAt: string;
  documentNumber: string | null;
  id: string;
  ipAddress: string | null;
  participantName: string;
  source: CertificatePublicAccessSource;
  userAgent: string | null;
}

export interface CertificateAccessLogPage {
  items: CertificateAccessLogItem[];
  page: number;
  pageCount: number;
  total: number;
}

export interface CertificateAccessLogsPageProps {
  searchParams: Promise<{ pagina?: string | string[] }>;
}
