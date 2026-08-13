import type { AttendanceActivityData, AttendanceFilters } from "@/features/attendance/types/attendance.types";

export interface ActivityAttendanceTemplateProps {
  data: AttendanceActivityData;
  filters: AttendanceFilters;
  result?: string;
}
