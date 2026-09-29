export interface CertificateBatchStatus {
  activity_id: string;
  blocked: number;
  created_at: string;
  email_attention: number;
  errors: { reason: string | null; registration_code?: string; registration_id: string }[];
  id: string;
  issued: number;
  pending: number;
  processing: number;
  recoverable: number;
  total: number;
}

export interface CertificateBatchActionResult {
  batch: CertificateBatchStatus | null;
  message?: string;
  processedCode?: string;
  stop?: boolean;
}

export interface CertificateBatchClaim {
  condition: string;
  eligible: boolean;
  item_id: string;
  lease_token: string;
  registration_id: string;
  template_id: string;
}
