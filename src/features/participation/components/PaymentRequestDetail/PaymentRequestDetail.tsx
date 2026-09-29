"use client";

import { useSearchParams } from "next/navigation";
import { z } from "zod";

import { PaymentDetailLoader } from "@/features/participation/components/PaymentDetailLoader/PaymentDetailLoader";
import { PaymentRequestDialog } from "@/features/participation/components/PaymentRequestDialog/PaymentRequestDialog";
import type { PaymentRequestDetailProps } from "@/features/participation/types/payment.types";
import { paymentDialogUrl } from "@/features/participation/utils/payment-dialog-url";

export function PaymentRequestDetail({ activityId }: PaymentRequestDetailProps) {
  const params = useSearchParams();
  const requestId = params.get("solicitud");
  if (!requestId) return null;
  function close() { window.history.replaceState(null, "", paymentDialogUrl(window.location.href)); }
  return <PaymentRequestDialog key={requestId} onClose={close} requestId={requestId}>
    {z.uuid().safeParse(requestId).success
      ? <PaymentDetailLoader activityId={activityId} requestId={requestId} />
      : <p role="alert">La solicitud no es válida.</p>}
  </PaymentRequestDialog>;
}
