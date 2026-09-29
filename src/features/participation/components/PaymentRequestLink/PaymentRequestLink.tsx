"use client";

import type { PaymentRequestLinkProps } from "@/features/participation/types/payment-detail.types";
import { paymentDialogUrl } from "@/features/participation/utils/payment-dialog-url";

export function PaymentRequestLink({ href, requestId, label, className, text = "Ver pago →", dialogId = "payment-request-dialog" }: PaymentRequestLinkProps) {
  return <a aria-controls={dialogId} aria-haspopup="dialog" aria-label={label}
    className={className} data-payment-trigger={requestId} href={href} onClick={(event) => {
      if (!requestId || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      window.history.pushState(null, "", paymentDialogUrl(window.location.href, requestId));
    }}>{text}</a>;
}
