import type { MemberGroupInput } from "@/features/member-groups/types/member-group.types";

// An uncertain network response may already have committed. A retry must use the
// original quote and payload even if presale expires while the response is lost.
export function reuseSubmittedGroup(input: MemberGroupInput, submitted: MemberGroupInput | null): MemberGroupInput {
  if (!submitted) return input;
  const current = { ...input, expected_unit_price: undefined };
  const previous = { ...submitted, expected_unit_price: undefined };
  return JSON.stringify(current) === JSON.stringify(previous) ? submitted : input;
}
