"use client";

import { useSearchParams } from "next/navigation";
import { z } from "zod";

import { BillingDetailLoader } from "@/features/billing/components/BillingDetailLoader";
import type { BillingDialogProps } from "@/features/billing/types/billing.types";
import { PaymentRequestDialog } from "@/features/participation/components/PaymentRequestDialog/PaymentRequestDialog";
import { paymentDialogUrl } from "@/features/participation/utils/payment-dialog-url";

export function BillingDialog({ activityId }: BillingDialogProps) {
  const params = useSearchParams();
  const requestId = params.get("solicitud");
  if (!requestId) return null;
  function close() { window.history.replaceState(null, "", paymentDialogUrl(window.location.href)); }
  return <PaymentRequestDialog key={requestId} onClose={close} requestId={requestId}
    title="Datos para comprobantes" dialogId="billing-request-dialog" headingId="billing-dialog-title">
    {z.uuid().safeParse(requestId).success ? <BillingDetailLoader activityId={activityId} requestId={requestId} /> : <p role="alert">La solicitud no es válida.</p>}
  </PaymentRequestDialog>;
}
