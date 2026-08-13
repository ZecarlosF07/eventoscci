import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthTemplate } from "@/components/templates/AuthTemplate";
import { ROUTES } from "@/constants/routes";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { getCurrentAccount } from "@/features/auth/queries/get-current-account";

export const metadata: Metadata = { description: "Crea tu cuenta vinculada a la identidad institucional de la Cámara de Comercio de Ica.", title: "Crear cuenta" };

export default async function RegisterPage() {
  const account = await getCurrentAccount();
  if (account?.isActive) redirect(account.role === "student" ? ROUTES.campus : ROUTES.admin);
  return <AuthTemplate description="Si ya participaste en una actividad, utilizaremos tu mismo documento para conservar el historial institucional." footer={<p>¿Ya tienes una cuenta? <Link className="font-semibold" href={ROUTES.login}>Inicia sesión</Link>.</p>} title="Crear cuenta del Campus"><RegisterForm /></AuthTemplate>;
}
