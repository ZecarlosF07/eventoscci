import type { AttendanceItem } from "@/features/attendance/types/attendance.types";

export interface AttendanceTableProps {
  activityId: string;
  attendance: AttendanceItem[];
  returnTo: string;
}
