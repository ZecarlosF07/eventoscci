import type { ActivityFormInput } from "@/features/activities/types/activity-form.types";

export function normalizeActivityCommercialFields(input: ActivityFormInput) {
  const paidCertificate = input.certificate_mode === "optional_paid";

  return {
    academic_hours: input.certificate_mode === "none" && input.status !== "archived"
      ? null : input.academic_hours || null,
    certificate_general_price: paidCertificate
      ? input.members_only ? input.certificate_member_price : input.certificate_general_price
      : "0",
    certificate_member_price: paidCertificate ? input.certificate_member_price : "0",
    general_price: input.is_free || input.members_only ? "0" : input.general_price || "0",
    member_price: input.is_free ? "0" : input.member_price || "0",
    member_free_passes_per_company: input.type === "event" && input.members_only && !input.is_free
      ? input.member_free_passes_per_company || "0" : "0",
    payment_note: input.is_free ? null : input.payment_note || null,
  };
}
