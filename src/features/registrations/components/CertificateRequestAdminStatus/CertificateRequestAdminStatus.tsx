import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { markCertificateRequestFollowedUpAction } from "@/features/registrations/mutations/registration-admin.actions";
import type { CertificateRequestAdminStatusProps } from "@/features/registrations/components/CertificateRequestAdminStatus/types/certificate-request-admin-status.types";
import { formatRegistrationDate, formatRegistrationPrice } from "@/features/registrations/utils/registration-formatters";

export function CertificateRequestAdminStatus({
  registration,
  returnTo,
}: CertificateRequestAdminStatusProps) {
  const currentMode = registration.activity.certificate_mode;
  if (currentMode === "none" || registration.certificate_mode_snapshot === "none") {
    return <span className="text-slate-400">—</span>;
  }
  if (currentMode === "included" || registration.certificate_mode_snapshot === "included") {
    return <Badge variant="success">Incluido</Badge>;
  }
  if (!registration.certificate_requested_at) {
    return (
      <div className="space-y-1">
        <Badge variant="neutral">Opcional</Badge>
        <p className="text-xs text-slate-600">
          {formatRegistrationPrice(registration.certificate_price_snapshot ?? 0)} · Sin solicitar
        </p>
      </div>
    );
  }

  const followedUp = Boolean(registration.certificate_followed_up_at);
  const action = markCertificateRequestFollowedUpAction.bind(null, registration.id, returnTo);
  return (
    <div className="min-w-48 space-y-2">
      <Badge variant={followedUp ? "success" : "warning"}>
        {followedUp ? "Atendida" : "Solicitó certificado"}
      </Badge>
      <p className="text-xs text-slate-600">
        {formatRegistrationPrice(registration.certificate_price_snapshot ?? 0)} · {formatRegistrationDate(registration.certificate_requested_at)}
      </p>
      {!followedUp ? (
        <form action={action}>
          <Button className="min-h-9 px-3 py-1 text-xs" type="submit" variant="secondary">Marcar seguimiento realizado</Button>
        </form>
      ) : null}
    </div>
  );
}
