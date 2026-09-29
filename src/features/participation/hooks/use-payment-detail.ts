"use client";

import { useAdminDetail } from "@/features/admin-details/hooks/use-admin-detail";
import { fetchPaymentDetail } from "@/features/participation/services/fetch-payment-detail";

export function usePaymentDetail(activityId: string, requestId: string) {
  return useAdminDetail(activityId, requestId, fetchPaymentDetail);
}
