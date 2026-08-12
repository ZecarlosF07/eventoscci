import type { Metadata } from "next";
import Link from "next/link";

import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { ROUTES } from "@/constants/routes";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  description: "Acceso interno para operadores y administradores de Eventos CCI.",
  title: "Acceso administrativo",
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <Text className="font-semibold uppercase tracking-[0.18em]" size="sm">
          Cámara de Comercio de Ica
        </Text>
        <Heading className="mt-3" level={1}>
          Administración
        </Heading>
        <Text className="mt-3 mb-7">
          Ingresa con una cuenta interna activa de operador o administrador.
        </Text>
        <LoginForm />
        <Link
          className="mt-6 inline-flex text-sm font-semibold text-slate-600 hover:text-slate-950"
          href={ROUTES.home}
        >
          Volver al portal público
        </Link>
      </section>
    </main>
  );
}
