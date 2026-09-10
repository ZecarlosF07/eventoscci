import type {
  ParticipationGlobalMetrics,
  ParticipationOverviewFilters,
  ParticipationOverviewPage,
} from "@/features/participation/types/participation.types";

export interface ParticipationOverviewTemplateProps {
  data: ParticipationOverviewPage;
  filters: ParticipationOverviewFilters;
  metrics: ParticipationGlobalMetrics;
}
