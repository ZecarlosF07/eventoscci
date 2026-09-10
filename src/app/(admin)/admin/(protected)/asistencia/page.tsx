import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

export default function AdminAttendancePage() {
  redirect(ROUTES.adminRegistrations);
}
