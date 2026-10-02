import "server-only";

import { getPublicActivityBySlug } from "@/features/activities/queries/get-public-activity";
import type { ActivityType } from "@/features/activities/types/activity.types";
import { getActivityPricingConfig } from "@/features/activities/utils/activity-pricing";
import { getRegistrationAvailability } from "@/features/registrations/queries/get-registration-availability";
import type { RegistrationPageData } from "@/features/registrations/types/registration.types";

export async function getRegistrationPageData(
  type: ActivityType,
  slug: string,
): Promise<RegistrationPageData | null> {
  const activity = await getPublicActivityBySlug(type, slug);
  if (!activity) return null;

  const availability = await getRegistrationAvailability(activity.id);
  if (!availability) return null;

  return {
    activity: {
      ...getActivityPricingConfig(activity),
      allowsStudentRegistration: activity.allows_student_registration,
      certificateGeneralPrice: activity.certificate_general_price,
      certificateMemberPrice: activity.certificate_member_price,
      certificateMode: activity.certificate_mode,
      id: activity.id,
      memberFreePassesPerCompany: activity.member_free_passes_per_company,
      membersOnly: activity.members_only,
      paymentNote: activity.payment_note,
      slug: activity.slug,
      title: activity.title,
      type: activity.type,
    },
    availability,
    initialNow: Date.now(),
  };
}
