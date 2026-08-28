import Link from "next/link";

import type { ActivityDetailTemplateProps } from "@/components/templates/ActivityDetailTemplate/types/activity-detail-template.types";
import { ActivityConversionPanel } from "@/features/activities/components/ActivityConversionPanel";
import { ActivityDetailHero } from "@/features/activities/components/ActivityDetailHero";
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
    <article className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <Link className="inline-flex min-h-11 items-center text-sm font-bold text-cci-700 transition hover:text-cci-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-800" href={getPublicActivityRoute(activity.type)}>← Volver al catálogo</Link>
      <ActivityDetailHero activity={activity} />
      <div className="mt-7 grid gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-10">
        <div className="lg:col-start-2 lg:row-start-1">
          <ActivityConversionPanel activity={activity} availability={availability} initialNow={initialNow} />
        </div>
        <div className="space-y-10 lg:col-start-1 lg:row-start-1 sm:space-y-12">
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
