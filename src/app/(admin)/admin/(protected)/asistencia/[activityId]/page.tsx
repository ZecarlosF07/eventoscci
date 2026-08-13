import { notFound } from "next/navigation";

import { ActivityAttendanceTemplate } from "@/components/templates/ActivityAttendanceTemplate";
import { getActivityAttendance } from "@/features/attendance/queries/get-activity-attendance";
import type { AttendanceActivityPageProps } from "@/features/attendance/types/attendance.types";
import { firstValue, parseAttendanceFilters } from "@/features/attendance/utils/attendance-filters";

export default async function ActivityAttendancePage({ params, searchParams }: AttendanceActivityPageProps) {
  const [{ activityId }, filters, query] = await Promise.all([params, parseAttendanceFilters(searchParams), searchParams]);
  const data = await getActivityAttendance(activityId, filters);
  if (!data) notFound();
  return <ActivityAttendanceTemplate data={data} filters={filters} result={firstValue(query.resultado)} />;
}
