"use client";

import { useState } from "react";

import { useAdminDetail } from "@/features/admin-details/hooks/use-admin-detail";
import { BillingDetail } from "@/features/billing/components/BillingDetail";
import { fetchBillingDetail } from "@/features/billing/services/fetch-billing-detail";
import type { BillingDetailLoaderProps } from "@/features/billing/types/billing.types";
import { PaymentDetailLoading } from "@/features/participation/components/PaymentDetailLoading/PaymentDetailLoading";

export function BillingDetailLoader({ activityId, requestId }: BillingDetailLoaderProps) {
  const { data, error, reload } = useAdminDetail(activityId, requestId, fetchBillingDetail);
  const [notice, setNotice] = useState("");
  function saved(message: string) { setNotice(message); reload(); }
  return <div className="space-y-3">
    {notice ? <p className="rounded-xl bg-cci-50 p-3 text-sm" role="status">{notice}</p> : null}
    {error ? <div className="space-y-3"><p role="alert">{error}</p><button className="min-h-11 rounded-xl border border-cci-200 px-4 font-semibold" onClick={reload} type="button">Reintentar</button></div>
      : data ? <BillingDetail item={data} onSaved={saved} /> : <PaymentDetailLoading />}
  </div>;
}
