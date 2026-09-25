import type { MemberPassAvailability } from "@/features/member-groups/types/member-group.types";

export function getMemberPassPricing(
  attendeeCount: number,
  memberPrice: number,
  isFree: boolean,
  availability: MemberPassAvailability | null,
) {
  const complimentaryCount = isFree ? 0 : Math.min(attendeeCount, availability?.remaining ?? 0);
  const paidCount = isFree ? 0 : attendeeCount - complimentaryCount;
  return { complimentaryCount, paidCount, total: paidCount * memberPrice };
}
