import type { AttendanceActivityData, AttendanceFilters } from "@/features/attendance/types/attendance.types";
import type { ParticipationActivitySummary } from "@/features/participation/types/participation.types";

export interface ActivityAttendanceTemplateProps {
  data: AttendanceActivityData;
  filters: AttendanceFilters;
  summary: ParticipationActivitySummary;
  result?: string;
}
