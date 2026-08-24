import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthTemplate } from "@/components/templates/AuthTemplate";
import { ROUTES } from "@/constants/routes";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { getCurrentAccount } from "@/features/auth/queries/get-current-account";
import type { AuthPageProps } from "@/features/auth/types/auth.types";
import { safeAuthRedirect } from "@/features/auth/utils/safe-auth-redirect";

export const metadata: Metadata = { description: "Crea tu cuenta vinculada a la identidad institucional de la Cámara de Comercio de Ica.", title: "Crear cuenta" };

export default async function RegisterPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const nextValue = typeof params.next === "string" ? params.next : undefined;
  const destination = safeAuthRedirect(nextValue);
  const hasCourseIntent = destination.startsWith(`${ROUTES.courses}/`);
  const account = await getCurrentAccount();
  if (account?.isActive) {
    const fallback = account.role === "student" ? ROUTES.campus : ROUTES.admin;
    redirect(safeAuthRedirect(nextValue, fallback));
  }
  const loginHref = hasCourseIntent ? `${ROUTES.login}?next=${encodeURIComponent(destination)}` : ROUTES.login;
  return <AuthTemplate description={hasCourseIntent ? "Crea tu cuenta para regresar al curso y completar la inscripción. Conservaremos tu historial institucional si ya participaste en una actividad." : "Si ya participaste en una actividad, utilizaremos tu mismo documento para conservar el historial institucional."} footer={<p>¿Ya tienes una cuenta? <Link className="font-semibold" href={loginHref}>Inicia sesión</Link>.</p>} title={hasCourseIntent ? "Crea tu cuenta para inscribirte" : "Crear cuenta del Campus"}><RegisterForm next={destination} /></AuthTemplate>;
}
