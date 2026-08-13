import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

export default function AdminLoginPage() {
  redirect(`${ROUTES.login}?next=${encodeURIComponent(ROUTES.admin)}`);
}
