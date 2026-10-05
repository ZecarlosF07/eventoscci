import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { ActivityCard } from "@/features/activities/components/ActivityCard";
import { CatalogSectionHeader } from "@/features/catalog/components/CatalogSectionHeader/CatalogSectionHeader";
import type { HomeActivitySectionProps } from "@/features/home/components/HomeActivitySection/types/home-activity-section.types";
import { HomeContentCarousel } from "@/features/home/components/HomeContentCarousel";

export function HomeActivitySection({ activities, description, href, title }: HomeActivitySectionProps) {
  return (
    <section className="py-5 sm:py-6">
      <HomeContentCarousel
        ariaLabel={title}
        emptyState={<div className="rounded-2xl border border-dashed border-cci-200 bg-white px-6 py-6"><Heading level={3}>La nueva agenda se publicará pronto</Heading><Text className="mt-2" size="sm">Revisa el catálogo para conocer las actividades disponibles.</Text></div>}
        header={<CatalogSectionHeader description={description} title={title} />}
        viewAllHref={href}
        viewAllLabel="Ver todos"
      >
        {activities.map((activity) => <ActivityCard activity={activity} key={activity.id} presentation={activities.length === 1 ? "featured" : "visual"} />)}
      </HomeContentCarousel>
    </section>
  );
}
