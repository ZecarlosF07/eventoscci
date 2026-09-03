import type { ActivityListItem } from "@/features/activities/types/activity.types";
import type { CertificateRecommendationSelection } from "@/features/certificates/types/certificate-recommendation.types";

function nextStart(activity: ActivityListItem, now: Date): number | null {
  const starts = activity.dates
    .filter((date) => !date.deleted_at)
    .map((date) => new Date(date.starts_at).getTime())
    .filter((timestamp) => timestamp >= now.getTime())
    .sort((first, second) => first - second);
  return starts[0] ?? null;
}

export function selectCertificateRecommendationCandidates({
  activities,
  context,
  limit = 12,
  now = new Date(),
}: CertificateRecommendationSelection): ActivityListItem[] {
  return activities
    .map((activity) => ({ activity, startsAt: nextStart(activity, now) }))
    .filter(({ activity, startsAt }) =>
      activity.status === "published" &&
      activity.id !== context?.source_activity_id &&
      !activity.registrations_closed_manually &&
      (!activity.registration_open_at || new Date(activity.registration_open_at) <= now) &&
      (!activity.registration_close_at || new Date(activity.registration_close_at) > now) &&
      startsAt !== null,
    )
    .sort((first, second) => {
      const firstRelated = context?.source_category_id && first.activity.category?.id === context.source_category_id ? 1 : 0;
      const secondRelated = context?.source_category_id && second.activity.category?.id === context.source_category_id ? 1 : 0;
      return secondRelated - firstRelated || (first.startsAt ?? 0) - (second.startsAt ?? 0);
    })
    .slice(0, limit)
    .map(({ activity }) => activity);
}
