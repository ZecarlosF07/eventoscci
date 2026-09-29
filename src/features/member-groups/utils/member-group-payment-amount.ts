import type { PaymentSeat } from "@/features/participation/types/payment-detail.types";

export function getMemberGroupPaymentAmount(
  attendees: readonly PaymentSeat[],
  selectedIds: readonly string[],
): number {
  const selected = new Set(selectedIds);
  const cents = attendees.reduce((total, attendee) => {
    if (!selected.has(attendee.id) || attendee.status !== "pending" || attendee.price <= 0 || attendee.isComplimentary) return total;
    return total + Math.round(attendee.price * 100);
  }, 0);
  return cents / 100;
}
