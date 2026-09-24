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
    <header className="mt-2 w-full border-l-4 border-cci-lime pl-4 sm:pl-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-cci-700">
        {ACTIVITY_TYPE_LABELS[activity.type]} · {getModalityLabel(activity.modality)}
        {activity.members_only ? " · Exclusivo para asociados" : ""}
      </p>
      <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-tight text-cci-950 sm:text-3xl lg:text-[2.25rem]">
        {activity.title}
      </h1>
      {nextDate || activity.venue ? (
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-base leading-snug text-cci-950">
          {nextDate ? <p><span className="font-semibold">Fecha:</span> {formatActivityDate(nextDate.starts_at)}</p> : null}
          {activity.venue ? <p><span className="font-semibold">Lugar:</span> {activity.venue.name}</p> : null}
        </div>
      ) : null}
    </header>
  );
}
