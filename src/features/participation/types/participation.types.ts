import type { ActivityStatus, ActivityType } from "@/features/activities/types/activity.types";

export type ParticipationPeriod = "all" | "past" | "upcoming";

export interface ParticipationActivitySummary {
  absentCount: number;
  activeCount: number;
  activityId: string;
  attendancePendingCount: number;
  attendedCount: number;
  cancelledCount: number;
  capacity: number | null;
  confirmedCount: number;
  isFree: boolean;
  lastDate: string | null;
  nextDate: string | null;
  pendingCount: number;
  slug: string;
  status: ActivityStatus;
  title: string;
  totalCount: number;
  type: ActivityType;
}

export interface ParticipationOverviewFilters {
  activityType?: ActivityType;
  page: number;
  period: ParticipationPeriod;
  query?: string;
}

export interface ParticipationOverviewPage {
  activities: ParticipationActivitySummary[];
  page: number;
  pageCount: number;
  total: number;
}

export interface ParticipationGlobalMetrics {
  active: number;
  attended: number;
  confirmed: number;
  pending: number;
}

export interface ParticipationOverviewPageProps {
  searchParams: Promise<{
    pagina?: string | string[];
    periodo?: string | string[];
    q?: string | string[];
    resultado?: string | string[];
    tipo?: string | string[];
  }>;
}
