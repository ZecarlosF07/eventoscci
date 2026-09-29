import type { AttendanceItem } from "@/features/attendance/types/attendance.types";

export interface AttendanceTableProps {
  activityId: string;
  attendance: AttendanceItem[];
  returnTo: string;
}
export interface AttendanceParticipantProps { item: AttendanceItem }
export interface AttendanceRowFormProps extends AttendanceParticipantProps { activityId: string; returnTo: string }
