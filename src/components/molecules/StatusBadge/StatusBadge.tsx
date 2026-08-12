import { Badge } from "@/components/atoms/Badge";
import type { BadgeVariant } from "@/components/atoms/Badge/types/badge.types";
import type { StatusBadgeProps } from "@/components/molecules/StatusBadge/types/status-badge.types";
import { ACTIVITY_STATUS_LABELS } from "@/features/activities/constants/activity.constants";

const STATUS_VARIANTS: Record<StatusBadgeProps["status"], BadgeVariant> = {
  archived: "neutral",
  cancelled: "warning",
  draft: "neutral",
  finished: "neutral",
  published: "success",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      {ACTIVITY_STATUS_LABELS[status]}
    </Badge>
  );
}
