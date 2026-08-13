import { AttendanceManagementTemplate } from "@/components/templates/AttendanceManagementTemplate";
import { getAttendanceActivities } from "@/features/attendance/queries/get-attendance-activities";

export default async function AdminAttendancePage() {
  const activities = await getAttendanceActivities();
  return <AttendanceManagementTemplate activities={activities} />;
}
