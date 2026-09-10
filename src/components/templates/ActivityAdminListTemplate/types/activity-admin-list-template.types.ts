import type { ActivityAdminFilters, ActivityAdminPage, ActivityType } from "@/features/activities/types/activity.types";

export interface ActivityAdminListTemplateProps {
  data: ActivityAdminPage;
  filters: ActivityAdminFilters;
  title: string;
  type: ActivityType;
}
