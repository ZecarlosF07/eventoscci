"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/atoms/Button";
import { CertificatePaymentDialog } from "@/features/registrations/components/CertificateCommercialActions/CertificatePaymentDialog";
import type {
  CertificateCommercialActionsProps,
  CertificatePaymentDialogMode,
} from "@/features/registrations/components/CertificateCommercialActions/types/certificate-commercial-actions.types";
import { registerCertificateRequestAdminAction } from "@/features/registrations/mutations/registration-admin.actions";
import { getActivityPaymentsRoute } from "@/features/participation/utils/participation-routes";

export function CertificateCommercialActions({
  activityId,
  certificateIssued,
  certificatePaymentVerified,
  certificatePrice,
  certificateRequested,
  disabled,
  participantName,
  registrationConfirmed,
  registrationId,
  returnTo,
  paymentWorkspace = false,
}: CertificateCommercialActionsProps) {
  const [mode, setMode] = useState<CertificatePaymentDialogMode | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const close = useCallback(() => {
    setMode(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);
  const open = (nextMode: CertificatePaymentDialogMode, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setMode(nextMode);
  };

  if (disabled || certificateIssued) return null;
  if (!certificateRequested) {
    const action = registerCertificateRequestAdminAction.bind(null, registrationId, activityId, returnTo);
    return <form action={action}><Button className="min-h-9 px-3 py-1 text-xs" type="submit" variant="secondary">Registrar solicitud</Button></form>;
  }

  if (!paymentWorkspace) return <Link className="inline-flex min-h-11 items-center text-sm font-semibold text-cci-700 underline" href={getActivityPaymentsRoute(activityId, undefined, registrationId)}>Ver pago del certificado →</Link>;

  return (
    <>
      {certificatePaymentVerified ? (
        <Button className="min-h-9 px-3 py-1 text-xs" onClick={(event) => open("revert", event.currentTarget)} variant="secondary">Revertir pago</Button>
      ) : registrationConfirmed ? (
        <Button className="min-h-9 px-3 py-1 text-xs" onClick={(event) => open("verify", event.currentTarget)}>Confirmar pago</Button>
      ) : (
        <p className="text-sm text-slate-600">Requiere confirmar participación</p>
      )}
      {mode ? (
        <CertificatePaymentDialog
          activityId={activityId}
          certificatePrice={certificatePrice}
          mode={mode}
          onClose={close}
          participantName={participantName}
          registrationId={registrationId}
          returnTo={returnTo}
        />
      ) : null}
    </>
  );
}
