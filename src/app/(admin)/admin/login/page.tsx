import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthTemplate } from "@/components/templates/AuthTemplate";
import { ROUTES } from "@/constants/routes";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getCurrentAccount } from "@/features/auth/queries/get-current-account";
import type { AuthPageProps } from "@/features/auth/types/auth.types";

export const metadata: Metadata = {
  description: "Acceso reservado para personal autorizado de la Cámara de Comercio de Ica.",
  robots: { follow: false, index: false },
  title: "Acceso interno",
};

export default async function AdminLoginPage({ searchParams }: AuthPageProps) {
  const account = await getCurrentAccount();
  if (account?.isActive) redirect(account.role === "student" ? ROUTES.campus : ROUTES.admin);

  const params = await searchParams;
  const nextValue = typeof params.next === "string" ? params.next : ROUTES.admin;
  return (
    <AuthTemplate
      description="Acceso exclusivo para operadores y administradores autorizados. Las cuentas internas no se crean desde este portal."
      eyebrow="Acceso interno"
      footer={<div className="flex flex-wrap justify-between gap-3"><Link className="font-semibold" href={ROUTES.forgotPassword}>Recuperar contraseña</Link><Link className="font-semibold" href={ROUTES.home}>Volver al sitio</Link></div>}
      title="Administración"
    >
      <LoginForm next={nextValue} portal="admin" />
    </AuthTemplate>
  );
}
