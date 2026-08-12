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
    <div className="space-y-8 py-12 sm:py-16">
      <SectionHeading description={description} eyebrow={eyebrow} title={title} />
      <ActivityFilters categories={categories} filters={filters} />
      {activities.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => <ActivityCard activity={activity} key={activity.id} />)}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center"><Text>{emptyMessage}</Text></div>
      )}
    </div>
  );
}
