import type { RegistrationFilterQuery } from "@/features/registrations/types/registration-query.types";
import type { RegistrationAdminFilters } from "@/features/registrations/types/registration.types";
import { escapePostgrestSearch } from "@/utils/postgrest-search";

/** One definition for the paginated list and the complete CSV. */
export function applyRegistrationFilters<T extends RegistrationFilterQuery<T>>(
  source: T, filters: Omit<RegistrationAdminFilters, "page">, excludeGroups = false,
): T {
  let query = source;
  if (filters.status) query = query.eq("status", filters.status);
  else if (filters.statusScope === "active") query = query.in("status", ["pending", "confirmed"]);
  if (excludeGroups) query = query.is("member_group_request_id", null);
  if (filters.activityId) query = query.eq("activity_id", filters.activityId);
  if (filters.activityType) query = query.eq("activity.type", filters.activityType);
  if (filters.registrationType) query = query.eq("registration_type", filters.registrationType);
  if (filters.profile) query = query.eq("participant_profile", filters.profile);
  if (filters.attendanceStatus) query = query.eq("attendance.status", filters.attendanceStatus);
  if (filters.certificateRequest === "not_requested") {
    query = query.eq("activity.certificate_mode", "optional_paid").eq("certificate_mode_snapshot", "optional_paid").is("certificate_requested_at", null);
  } else if (filters.certificateRequest === "payment_pending") {
    query = query.eq("activity.certificate_mode", "optional_paid").eq("certificate_mode_snapshot", "optional_paid").not("certificate_requested_at", "is", null).is("certificate_payment_verified_at", null);
  } else if (filters.certificateRequest === "payment_verified") {
    query = query.eq("activity.certificate_mode", "optional_paid").eq("certificate_mode_snapshot", "optional_paid").not("certificate_payment_verified_at", "is", null);
  } else if (filters.certificateRequest === "ready_to_issue") {
    query = query.eq("status", "confirmed").eq("attendance.status", "attended")
      .in("activity.certificate_mode", ["included", "optional_paid"])
      .or("certificate_mode_snapshot.eq.included,and(certificate_mode_snapshot.eq.optional_paid,certificate_requested_at.not.is.null,certificate_payment_verified_at.not.is.null)")
      .is("certificate", null);
  }
  if (filters.query) query = query.ilike("search_text", `%${escapePostgrestSearch(filters.query)}%`);
  return query;
}
