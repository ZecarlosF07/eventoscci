import type { z } from "zod";

import type { paymentDetailSchema, paymentSeatSchema } from "@/features/participation/schemas/payment-detail.schema";

export type PaymentDetailData = z.infer<typeof paymentDetailSchema>;
export type PaymentSeat = z.infer<typeof paymentSeatSchema>;
export interface PaymentDetailContentProps { activityId: string; detail: PaymentDetailData; onVerified: () => void }
export interface PaymentDetailLoaderProps { activityId: string; requestId: string }
export interface PaymentRequestLinkProps { href: string; requestId: string | null; label: string; className: string; text?: string; dialogId?: string }
export interface GroupPaymentFormProps { detail: { request: { id: string }; attendees: PaymentSeat[] }; onVerified?: () => void }
export interface PaymentDetailRouteContext { params: Promise<{ activityId: string; requestId: string }> }
