import { Text } from "@/components/atoms/Text";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { ActivitiesListTemplateProps } from "@/components/templates/ActivitiesListTemplate/types/activities-list-template.types";
import { ActivityCard } from "@/features/activities/components/ActivityCard";
import { ActivityFilters } from "@/features/activities/components/ActivityFilters";

export function ActivitiesListTemplate({
  activities,
  categories,
  description,
  emptyMessage,
  eyebrow,
  filters,
  title,
}: ActivitiesListTemplateProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="overflow-hidden rounded-[2rem] bg-cci-950 px-6 py-10 sm:px-10">
        <div className="max-w-3xl [&_h1]:text-white [&_p]:text-white/70">
          <SectionHeading description={description} eyebrow={eyebrow} title={title} />
        </div>
      </header>
      <div className="relative -mt-4 px-2 sm:px-5">
        <ActivityFilters categories={categories} filters={filters} />
      </div>
      {activities.length ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => <ActivityCard activity={activity} key={activity.id} />)}
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed border-cci-200 bg-white px-6 py-16 text-center"><Text>{emptyMessage}</Text></div>
      )}
    </div>
  );
}
