import type { ActivityAdminDetail, ActivityStatus, ActivityType } from "@/features/activities/types/activity.types";

export interface ActivityPricingFieldsProps {
  activity?: ActivityAdminDetail;
  errors?: Record<string, string[]>;
  isFree: boolean;
  membersOnly: boolean;
  onFreeChange: (value: boolean) => void;
  onMembersOnlyChange: (value: boolean) => void;
  status: ActivityStatus;
  type: ActivityType;
}
