import { redirect } from "next/navigation";

import type { LegacyPaymentPageProps } from "@/features/participation/types/payment.types";
import { legacyConfirmedRoute } from "@/features/participation/utils/legacy-payment-route";

export default async function ConfirmedRegistrationsPage({ searchParams }: LegacyPaymentPageProps) {
  redirect(legacyConfirmedRoute(await searchParams));
}
