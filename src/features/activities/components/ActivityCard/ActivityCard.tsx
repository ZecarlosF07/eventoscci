import { Badge } from "@/components/atoms/Badge";
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
import {
  canActivityInviteRegistration,
  hasActivityEnded,
  getActivityEndTimestamp,
} from "@/features/activities/utils/activity-lifecycle";
import { getPublicActivityRoute } from "@/features/activities/utils/activity-routes";
import { CatalogCard } from "@/features/catalog/components/CatalogCard/CatalogCard";

export function ActivityCard({ activity, presentation = "default" }: ActivityCardProps) {
  const isVisual = presentation !== "default";
  const now = new Date();
  const nextDate = getNextActivityDate(activity.dates);
  const endedByDate = hasActivityEnded(activity.dates, now);
  const eventEnd = activity.type === "event" ? getActivityEndTimestamp(activity.dates) : null;
  const endedDate = eventEnd !== null ? new Date(eventEnd).toISOString() : nextDate?.ends_at ?? nextDate?.starts_at;
  const isFinished = activity.status === "finished" || endedByDate;
  const canRegister = canActivityInviteRegistration(activity, now);
  const bannerUrl = getActivityBannerUrl(activity.banner_path);
  const href = getPublicActivityRoute(activity.type, activity.slug);
  return (
    <CatalogCard
      action={canRegister ? "Inscríbete" : "Ver detalles"}
      bannerUrl={bannerUrl}
      featured={presentation === "featured"}
      href={href}
      id={`activity-${activity.id}`}
      labels={(
        <>
          {!isVisual ? <Badge>{ACTIVITY_TYPE_LABELS[activity.type]}</Badge> : null}
          <Badge>{getModalityLabel(activity.modality)}</Badge>
          {activity.members_only ? <Badge variant="warning">Solo asociados</Badge> : null}
          {activity.status === "cancelled" ? <StatusBadge status={activity.status} /> : null}
          {activity.status !== "cancelled" && isFinished ? <StatusBadge status="finished" /> : null}
        </>
      )}
      metadata={nextDate ? <Text className="font-semibold text-cci-800" size="sm">{endedByDate ? "Finalizó el " : ""}{formatActivityDate(endedByDate ? endedDate ?? nextDate.starts_at : nextDate.starts_at)}</Text> : null}
      price={<PriceDisplay initialNow={now.getTime()} type={activity.type} presaleGeneralPrice={activity.presale_general_price} presaleMemberPrice={activity.presale_member_price} presaleEndsAt={activity.presale_ends_at} generalPrice={activity.general_price} isFree={activity.is_free} memberPrice={activity.member_price} membersOnly={activity.members_only} />}
      title={activity.title}
    >
      {!isVisual && activity.category ? <Text size="sm">{activity.category.name}</Text> : null}
      {!isVisual && activity.short_description ? <Text size="sm">{activity.short_description}</Text> : null}
    </CatalogCard>
  );
}
