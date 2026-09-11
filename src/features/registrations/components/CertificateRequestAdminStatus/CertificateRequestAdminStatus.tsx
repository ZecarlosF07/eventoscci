import { Badge } from "@/components/atoms/Badge";
import { CertificateCommercialActions } from "@/features/registrations/components/CertificateCommercialActions";
import type { CertificateRequestAdminStatusProps } from "@/features/registrations/components/CertificateRequestAdminStatus/types/certificate-request-admin-status.types";
import type { CertificateCommercialStatus } from "@/features/registrations/types/certificate-commercial-status.types";
import {
  CERTIFICATE_COMMERCIAL_STATUS_LABELS,
  getCertificateCommercialStatus,
} from "@/features/registrations/utils/certificate-commercial-status";
import { formatRegistrationDate, formatRegistrationPrice } from "@/features/registrations/utils/registration-formatters";

function badgeVariant(status: CertificateCommercialStatus): "neutral" | "success" | "warning" {
  if (status === "issued" || status === "ready_to_issue") return "success";
  if (status === "payment_pending" || status === "payment_verified_pending_attendance") return "warning";
  return "neutral";
}

export function CertificateRequestAdminStatus({
  registration,
  returnTo,
}: CertificateRequestAdminStatusProps) {
  const certificate = registration.certificate[0] ?? null;
  const attendanceStatus = registration.attendance[0]?.status ?? "pending";
  const commercialStatus = getCertificateCommercialStatus({
    attendanceStatus,
    certificateMode: registration.certificate_mode_snapshot,
    certificatePaymentVerifiedAt: registration.certificate_payment_verified_at,
    certificateRequestedAt: registration.certificate_requested_at,
    certificateStatus: certificate?.status,
    currentMode: registration.activity.certificate_mode,
    registrationStatus: registration.status,
  });
  if (commercialStatus === "unavailable") {
    return <span className="text-slate-400">—</span>;
  }

  const optionalPaid = registration.certificate_mode_snapshot === "optional_paid"
    && registration.activity.certificate_mode === "optional_paid";
  const participantName = `${registration.person.first_names} ${registration.person.last_names}`;
  return (
    <div className="min-w-52 space-y-2">
      <Badge variant={badgeVariant(commercialStatus)}>{CERTIFICATE_COMMERCIAL_STATUS_LABELS[commercialStatus]}</Badge>
      {optionalPaid ? <p className="text-xs font-semibold text-slate-700">{formatRegistrationPrice(registration.certificate_price_snapshot ?? 0)}</p> : null}
      {registration.certificate_requested_at ? (
        <p className="text-xs text-slate-600">Solicitud: {formatRegistrationDate(registration.certificate_requested_at)} · {registration.certificateRequestedByName ?? "Participante"}</p>
      ) : null}
      {registration.certificate_payment_verified_at ? (
        <p className="text-xs text-slate-600">Pago: {formatRegistrationDate(registration.certificate_payment_verified_at)} · {registration.certificatePaymentVerifiedByName ?? "Personal CCI"}</p>
      ) : null}
      {optionalPaid ? (
        <CertificateCommercialActions
          activityId={registration.activity.id}
          certificateIssued={Boolean(certificate)}
          certificatePaymentVerified={Boolean(registration.certificate_payment_verified_at)}
          certificatePrice={registration.certificate_price_snapshot ?? 0}
          certificateRequested={Boolean(registration.certificate_requested_at)}
          disabled={registration.status === "cancelled"
            || !["published", "finished"].includes(registration.activity.status)}
          participantName={participantName}
          registrationConfirmed={registration.status === "confirmed"}
          registrationId={registration.id}
          returnTo={returnTo}
        />
      ) : null}
    </div>
  );
}
