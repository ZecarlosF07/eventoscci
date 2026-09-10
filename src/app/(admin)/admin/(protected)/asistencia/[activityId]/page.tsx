import { redirect } from "next/navigation";

import type { AttendanceActivityPageProps } from "@/features/attendance/types/attendance.types";
import { getActivityAttendanceRoute } from "@/features/participation/utils/participation-routes";

export default async function LegacyActivityAttendancePage({ params }: AttendanceActivityPageProps) {
  const { activityId } = await params;
  redirect(getActivityAttendanceRoute(activityId));
}
