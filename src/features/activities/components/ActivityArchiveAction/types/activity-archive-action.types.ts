import type {
  ActivityStatus,
  ActivityType,
} from "@/features/activities/types/activity.types";

export interface ActivityArchiveActionProps {
  activityId: string;
  activityTitle: string;
  activityType: ActivityType;
  status: ActivityStatus;
}

export interface ActivityArchiveDialogProps extends ActivityArchiveActionProps {
  onClose: () => void;
}
