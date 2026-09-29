"use client";

import { PaymentDetailContent } from "@/features/participation/components/PaymentDetailContent/PaymentDetailContent";
import { PaymentDetailLoading } from "@/features/participation/components/PaymentDetailLoading/PaymentDetailLoading";
import { usePaymentDetail } from "@/features/participation/hooks/use-payment-detail";
import type { PaymentDetailLoaderProps } from "@/features/participation/types/payment-detail.types";

export function PaymentDetailLoader({ activityId, requestId }: PaymentDetailLoaderProps) {
  const { data, error, reload } = usePaymentDetail(activityId, requestId);
  if (error) return <div className="space-y-3"><p role="alert">{error}</p><button className="min-h-11 rounded-xl border border-cci-200 px-4 font-semibold" onClick={reload} type="button">Reintentar</button></div>;
  if (!data) return <PaymentDetailLoading />;
  return <PaymentDetailContent activityId={activityId} detail={data} onVerified={reload} />;
}
