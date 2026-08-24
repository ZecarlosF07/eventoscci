import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { VisualContentCard } from "@/components/molecules/VisualContentCard";
import {
  formatActivityDate,
  getActivityBannerUrl,
  getNextActivityDate,
} from "@/features/activities/utils/activity-formatters";
import { getPublicActivityRoute } from "@/features/activities/utils/activity-routes";
import type { HomeActivitySectionProps } from "@/features/home/components/HomeActivitySection/types/home-activity-section.types";
import { HomeContentCarousel } from "@/features/home/components/HomeContentCarousel";

export function HomeActivitySection({
  activities,
  description,
  href,
  title,
}: HomeActivitySectionProps) {
  return (
    <section className="py-8 sm:py-10">
      <HomeContentCarousel
        ariaLabel={title}
        emptyState={(
          <div className="rounded-3xl border border-dashed border-cci-200 bg-white px-6 py-12 text-center">
            <Heading level={3}>La nueva agenda se publicará pronto</Heading>
            <Text className="mx-auto mt-2 max-w-xl">Revisa el catálogo para conocer las actividades disponibles.</Text>
          </div>
        )}
        header={(
          <div className="flex gap-4">
            <span aria-hidden="true" className="mt-1 h-12 w-1 shrink-0 rounded-full bg-cci-lime" />
            <div>
              <Heading level={2}>{title}</Heading>
              <Text className="mt-2">{description}</Text>
            </div>
          </div>
        )}
        viewAllHref={href}
        viewAllLabel="Ver todos"
      >
        {activities.map((activity, index) => {
          const nextDate = getNextActivityDate(activity.dates);

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
      </HomeContentCarousel>
    </section>
  );
}
