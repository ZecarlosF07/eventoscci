import type { ActivityAdminPage, ActivityStatus, ActivityType } from "@/features/activities/types/activity.types";

export interface ActivityAdminListTemplateProps {
  data: ActivityAdminPage;
  filters: { query?: string; status?: ActivityStatus };
  title: string;
  type: ActivityType;
}
