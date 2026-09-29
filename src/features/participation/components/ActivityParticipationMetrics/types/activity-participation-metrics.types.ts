import type { ParticipationActivitySummary } from "@/features/participation/types/participation.types";

export interface ActivityParticipationMetricsProps {
  activity: ParticipationActivitySummary;
  mode?: "attendance" | "registrations";
  compact?: boolean;
}
