import "server-only";

import type { ActivityType } from "@/features/activities/types/activity.types";
import { getPublicActivityBySlug } from "@/features/activities/queries/get-public-activity";
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
      certificateGeneralPrice: activity.certificate_general_price,
      certificateMemberPrice: activity.certificate_member_price,
      certificateMode: activity.certificate_mode,
      generalPrice: activity.general_price,
      id: activity.id,
      isFree: activity.is_free,
      memberPrice: activity.member_price,
      membersOnly: activity.members_only,
      slug: activity.slug,
      title: activity.title,
      type: activity.type,
    },
    availability,
  };
}
