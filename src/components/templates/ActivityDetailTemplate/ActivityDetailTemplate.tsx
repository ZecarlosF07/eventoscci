import Link from "next/link";

import type { ActivityDetailTemplateProps } from "@/components/templates/ActivityDetailTemplate/types/activity-detail-template.types";
import { ActivityConversionPanel } from "@/features/activities/components/ActivityConversionPanel";
import { ActivityDetailHero } from "@/features/activities/components/ActivityDetailHero";
import { ActivityDetailMedia } from "@/features/activities/components/ActivityDetailMedia";
import { ActivityInformation } from "@/features/activities/components/ActivityInformation";
import { ActivityLocationMap } from "@/features/activities/components/ActivityLocationMap";
import { ActivityProgramGallery } from "@/features/activities/components/ActivityProgramGallery";
import { ActivitySchedule } from "@/features/activities/components/ActivitySchedule";
import { ActivitySpeakers } from "@/features/activities/components/ActivitySpeakers";
import { RelatedActivities } from "@/features/activities/components/RelatedActivities";
import { getRelatedActivities } from "@/features/activities/queries/get-related-activities";
import { getPublicActivityRoute } from "@/features/activities/utils/activity-routes";
import { getRegistrationAvailability } from "@/features/registrations/queries/get-registration-availability";
import { getServerTimestamp } from "@/utils/get-server-timestamp";

export async function ActivityDetailTemplate({ activity }: ActivityDetailTemplateProps) {
  const initialNow = getServerTimestamp();
  const [availability, relatedActivities] = await Promise.all([
    getRegistrationAvailability(activity.id),
    getRelatedActivities(activity),
  ]);

  return (
    <article className="mx-auto w-full max-w-[92rem] px-4 pb-8 pt-4 sm:px-6 sm:pb-12 sm:pt-6 lg:px-8">
      <Link className="group inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-cci-700 transition hover:text-cci-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cci-800" href={getPublicActivityRoute(activity.type)}><span aria-hidden="true" className="transition-transform group-hover:-translate-x-1 motion-reduce:transform-none">←</span>Volver al catálogo</Link>
      <div className="mt-3"><ActivityDetailHero activity={activity} /></div>
      <div className="mt-5 grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:gap-x-10 xl:gap-y-10">
        <div className="min-w-0 xl:col-start-1 xl:row-start-1">
          <ActivityDetailMedia activity={activity} />
        </div>
        <div className="min-w-0 xl:sticky xl:top-24 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:self-start">
          <ActivityConversionPanel activity={activity} availability={availability} initialNow={initialNow} />
        </div>
        <div className="min-w-0 space-y-10 xl:col-start-1 xl:row-start-2 sm:space-y-12">
          <ActivityInformation activity={activity} />
          <ActivityProgramGallery activityTitle={activity.title} imagePaths={activity.program_image_paths ?? []} />
          <ActivitySchedule dates={activity.dates} />
          <ActivityLocationMap activity={activity} />
          <ActivitySpeakers speakers={activity.speakers} />
        </div>
      </div>
      <RelatedActivities activities={relatedActivities} />
    </article>
  );
}
