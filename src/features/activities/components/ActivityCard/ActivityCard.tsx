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

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/8] bg-slate-100">
        {bannerUrl ? (
          <Image alt="" className="object-cover" fill sizes="(min-width: 768px) 33vw, 100vw" src={bannerUrl} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">CCI</div>
        )}
      </div>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge>{ACTIVITY_TYPE_LABELS[activity.type]}</Badge>
          <Badge>{getModalityLabel(activity.modality)}</Badge>
          {activity.members_only ? <Badge variant="warning">Solo asociados</Badge> : null}
          {activity.status === "cancelled" ? <StatusBadge status={activity.status} /> : null}
        </div>
        <div>
          <Heading level={3}>{activity.title}</Heading>
          {activity.category ? <Text className="mt-1" size="sm">{activity.category.name}</Text> : null}
        </div>
        {activity.short_description ? <Text size="sm">{activity.short_description}</Text> : null}
        {nextDate ? <Text className="font-medium text-slate-800" size="sm">{formatActivityDate(nextDate.starts_at)}</Text> : null}
        <div className="flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
          <PriceDisplay generalPrice={activity.general_price} isFree={activity.is_free} memberPrice={activity.member_price} />
          <Link className="text-sm font-semibold text-slate-950 underline-offset-4 hover:underline" href={getPublicActivityRoute(activity.type, activity.slug)}>Ver detalle</Link>
        </div>
      </div>
    </article>
  );
}
