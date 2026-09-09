import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { PriceDisplay } from "@/components/molecules/PriceDisplay";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import type { ActivityCardProps } from "@/features/activities/components/ActivityCard/types/activity-card.types";
import { ACTIVITY_TYPE_LABELS } from "@/features/activities/constants/activity.constants";
import {
  formatActivityDate,
  getActivityBannerUrl,
  getModalityLabel,
  getNextActivityDate,
} from "@/features/activities/utils/activity-formatters";
import { getPublicActivityRoute } from "@/features/activities/utils/activity-routes";

export function ActivityCard({ activity }: ActivityCardProps) {
  const nextDate = getNextActivityDate(activity.dates);
  const bannerUrl = getActivityBannerUrl(activity.banner_path);
  const href = getPublicActivityRoute(activity.type, activity.slug);
  const actionId = `activity-${activity.id}-action`;
  const titleId = `activity-${activity.id}-title`;

  return (
    <Link aria-labelledby={`${titleId} ${actionId}`} className="group block h-full rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cci-800" href={href}>
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-cci-100 bg-white shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:border-cci-200 group-hover:shadow-xl">
        <div className="relative aspect-[5/2] overflow-hidden bg-cci-950">
          {bannerUrl ? (
            <Image alt={`Banner de ${activity.title}`} className="object-contain transition duration-300 group-hover:brightness-110" fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" src={bannerUrl} />
          ) : (
            <div className="relative flex h-full items-center justify-center overflow-hidden text-4xl font-bold tracking-[-0.08em] text-white/85">
              <span className="absolute -right-10 -top-16 size-52 rounded-full border border-cci-lime/50" />
              <span className="absolute -right-4 -top-10 size-40 rounded-full border border-cci-lime/25" />
              <span>CCI</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            <Badge>{ACTIVITY_TYPE_LABELS[activity.type]}</Badge>
            <Badge>{getModalityLabel(activity.modality)}</Badge>
            {activity.members_only ? <Badge variant="warning">Solo asociados</Badge> : null}
            {activity.status === "cancelled" ? <StatusBadge status={activity.status} /> : null}
          </div>
          <div>
            <Heading id={titleId} level={3}>{activity.title}</Heading>
            {activity.category ? <Text className="mt-1" size="sm">{activity.category.name}</Text> : null}
          </div>
          {activity.short_description ? <Text size="sm">{activity.short_description}</Text> : null}
          {nextDate ? <Text className="font-semibold text-cci-800" size="sm">{formatActivityDate(nextDate.starts_at)}</Text> : null}
          <div className="mt-auto flex items-end justify-between gap-4 border-t border-cci-100 pt-4">
            <PriceDisplay generalPrice={activity.general_price} isFree={activity.is_free} memberPrice={activity.member_price} />
            <span className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl bg-cci-950 px-4 py-2 text-sm font-bold text-white transition group-hover:bg-cci-800" id={actionId}>
              Inscríbete <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
