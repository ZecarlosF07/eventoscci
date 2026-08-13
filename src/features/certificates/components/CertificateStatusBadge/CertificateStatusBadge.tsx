import { Badge } from "@/components/atoms/Badge";
import type { CertificateStatusBadgeProps } from "@/features/certificates/components/CertificateStatusBadge/types/certificate-status-badge.types";
import { CERTIFICATE_STATUS_LABELS } from "@/features/certificates/constants/certificate.constants";

export function CertificateStatusBadge({ status }: CertificateStatusBadgeProps) {
  return <Badge variant={status === "issued" ? "success" : "warning"}>{CERTIFICATE_STATUS_LABELS[status]}</Badge>;
}
