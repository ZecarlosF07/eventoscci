import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

export default function ConfirmedRegistrationsPage() {
  redirect(ROUTES.adminRegistrations);
}
