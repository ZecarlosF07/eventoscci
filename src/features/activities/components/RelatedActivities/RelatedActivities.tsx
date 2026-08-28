import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { VisualContentCard } from "@/components/molecules/VisualContentCard";
import type { RelatedActivitiesProps } from "@/features/activities/components/RelatedActivities/types/related-activities.types";
import {
  formatActivityDate,
  getActivityBannerUrl,
  getUpcomingActivityDate,
} from "@/features/activities/utils/activity-formatters";
import { getPublicActivityRoute } from "@/features/activities/utils/activity-routes";

export function RelatedActivities({ activities }: RelatedActivitiesProps) {
  if (!activities.length) return null;

  return (
    <section className="mt-14 border-t border-cci-100 pt-10 sm:mt-20 sm:pt-14">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cci-700">Continúa explorando</p>
        <Heading className="mt-2" level={2}>Próximas actividades para ti</Heading>
        <Text className="mt-2">Encuentra más espacios para conectar, aprender y hacer crecer tu empresa.</Text>
      </div>
      <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity, index) => {
          const nextDate = getUpcomingActivityDate(activity.dates);
          return (
            <VisualContentCard
              animationOrder={index}
              bannerUrl={getActivityBannerUrl(activity.banner_path)}
              href={getPublicActivityRoute(activity.type, activity.slug)}
              key={activity.id}
              meta={nextDate ? formatActivityDate(nextDate.starts_at) : null}
              summary={activity.short_description}
              title={activity.title}
            />
          );
        })}
      </div>
    </section>
  );
}
