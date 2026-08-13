import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthTemplate } from "@/components/templates/AuthTemplate";
import { ROUTES } from "@/constants/routes";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { getCurrentAccount } from "@/features/auth/queries/get-current-account";

export const metadata: Metadata = { title: "Restablecer contraseña" };

export default async function ResetPasswordPage() {
  const account = await getCurrentAccount();
  if (!account) redirect(`${ROUTES.login}?error=confirmation`);
  return <AuthTemplate description="Define una contraseña nueva para continuar usando la misma cuenta e identidad institucional." footer={<Link className="font-semibold" href={ROUTES.login}>Volver al inicio de sesión</Link>} title="Nueva contraseña"><ResetPasswordForm /></AuthTemplate>;
}
