import { redirect } from "next/navigation";

import type { LegacyPaymentPageProps } from "@/features/participation/types/payment.types";
import { legacyPaymentRoute } from "@/features/participation/utils/legacy-payment-route";

export default async function PendingRegistrationsPage({ searchParams }: LegacyPaymentPageProps) {
  redirect(legacyPaymentRoute(await searchParams));
}
