import type { Metadata } from "next";
import Link from "next/link";

import { AuthTemplate } from "@/components/templates/AuthTemplate";
import { ROUTES } from "@/constants/routes";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function ForgotPasswordPage() {
  return <AuthTemplate description="Te enviaremos las instrucciones si el correo está asociado a una cuenta." footer={<Link className="font-semibold" href={ROUTES.login}>Volver al inicio de sesión</Link>} title="Recuperar contraseña"><ForgotPasswordForm /></AuthTemplate>;
}
