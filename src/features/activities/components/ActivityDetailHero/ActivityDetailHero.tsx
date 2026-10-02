import { Badge } from "@/components/atoms/Badge";
import type { ActivityDetailHeroProps } from "@/features/activities/components/ActivityDetailHero/types/activity-detail-hero.types";
import { ACTIVITY_TYPE_LABELS } from "@/features/activities/constants/activity.constants";
import {
  formatActivityDate,
  getModalityLabel,
  getNextActivityDate,
} from "@/features/activities/utils/activity-formatters";

export function ActivityDetailHero({ activity }: ActivityDetailHeroProps) {
  const nextDate = getNextActivityDate(activity.dates);

  return (
    <header className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-cci-950 px-3 py-1.5 text-white ring-transparent">{ACTIVITY_TYPE_LABELS[activity.type]}</Badge>
        <Badge className="px-3 py-1.5">{getModalityLabel(activity.modality)}</Badge>
        {activity.members_only ? <Badge className="bg-cci-lime/20 px-3 py-1.5 text-cci-800 ring-cci-lime/30">Exclusivo para asociados</Badge> : null}
      </div>
      <h1 className="max-w-4xl break-words text-3xl font-semibold leading-[1.12] tracking-tight text-balance text-cci-950 sm:text-4xl">
        {activity.title}
      </h1>
      {nextDate ? (
        <p className="flex items-start gap-2.5 text-sm leading-6 text-cci-700 sm:text-base">
          <svg aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-cci-600" fill="none" viewBox="0 0 24 24">
            <path d="M8 3v4m8-4v4M4 10h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
          </svg>
          <time dateTime={nextDate.starts_at}>{formatActivityDate(nextDate.starts_at)}</time>
        </p>
      ) : null}
    </header>
  );
}
