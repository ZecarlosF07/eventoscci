import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthTemplate } from "@/components/templates/AuthTemplate";
import { ROUTES } from "@/constants/routes";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getCurrentAccount } from "@/features/auth/queries/get-current-account";
import type { AuthPageProps } from "@/features/auth/types/auth.types";
import { loginErrorMessage } from "@/features/auth/utils/auth-errors";
import { safeAuthRedirect } from "@/features/auth/utils/safe-auth-redirect";

export const metadata: Metadata = { description: "Accede a tu cuenta del Campus Virtual de la Cámara de Comercio de Ica.", title: "Iniciar sesión" };

export default async function LoginPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const nextValue = typeof params.next === "string" ? params.next : undefined;
  const destination = safeAuthRedirect(nextValue);
  const hasCourseIntent = destination.startsWith(`${ROUTES.courses}/`);
  const account = await getCurrentAccount();
  if (account?.isActive) {
    const fallback = account.role === "student" ? ROUTES.campus : ROUTES.admin;
    redirect(safeAuthRedirect(nextValue, fallback));
  }
  const errorCode = typeof params.error === "string" ? params.error : undefined;
  const registerHref = hasCourseIntent ? `${ROUTES.register}?next=${encodeURIComponent(destination)}` : ROUTES.register;
  return <AuthTemplate description={hasCourseIntent ? "Ingresa a tu cuenta para volver al curso y completar la inscripción." : "Usa el correo y la contraseña de tu cuenta."} footer={<div className="flex flex-wrap justify-between gap-3"><Link className="font-semibold" href={ROUTES.forgotPassword}>Olvidé mi contraseña</Link><Link className="font-semibold" href={registerHref}>Crear cuenta para el Campus</Link></div>} title={hasCourseIntent ? "Continúa tu inscripción" : "Iniciar sesión"}><LoginForm next={hasCourseIntent ? destination : nextValue} />{errorCode ? <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{loginErrorMessage(errorCode)}</p> : null}</AuthTemplate>;
}
