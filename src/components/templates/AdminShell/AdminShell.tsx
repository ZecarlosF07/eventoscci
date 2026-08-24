import Link from "next/link";

import { BrandLogo } from "@/components/atoms/BrandLogo";
import { Button } from "@/components/atoms/Button";
import { NavigationLinks } from "@/components/molecules/NavigationLinks";
import { Text } from "@/components/atoms/Text";
import type { AdminShellProps } from "@/components/templates/AdminShell/types/admin-shell.types";
import { ADMIN_NAVIGATION } from "@/config/navigation";
import { ROUTES } from "@/constants/routes";
import { logoutAction } from "@/features/auth/mutations/auth.actions";

export function AdminShell({ children, email, name }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-cci-50 lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col bg-cci-950 p-6 text-white lg:flex">
        <Link aria-label="Ir al resumen administrativo" href={ROUTES.admin}><BrandLogo className="w-44" light /></Link>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-cci-lime">Administración</p>
        <nav aria-label="Navegación administrativa" className="mt-4 flex-1 overflow-y-auto"><NavigationLinks items={ADMIN_NAVIGATION} variant="admin" /></nav>
        <div className="mt-5 border-t border-white/10 pt-5">
          <Text className="font-semibold text-white" size="sm">{name}</Text>
          <Text className="break-all text-white/55" size="sm">{email}</Text>
          <form action={logoutAction} className="mt-4"><Button className="w-full border-white/20 bg-transparent text-white hover:bg-white/10" type="submit" variant="secondary">Cerrar sesión</Button></form>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-cci-100 bg-white/95 px-5 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <Link href={ROUTES.admin}><BrandLogo className="w-36" /></Link>
            <details className="relative"><summary className="flex min-h-11 cursor-pointer list-none items-center rounded-xl border border-cci-200 px-3 text-sm font-semibold marker:content-none">☰ Menú</summary><div className="absolute right-0 top-14 w-[min(20rem,calc(100vw-2.5rem))] rounded-2xl bg-cci-950 p-4 shadow-xl"><nav aria-label="Navegación administrativa móvil"><NavigationLinks items={ADMIN_NAVIGATION} variant="admin" /></nav><div className="mt-4 border-t border-white/10 pt-4"><Text className="text-white" size="sm">{name}</Text><form action={logoutAction} className="mt-3"><Button className="w-full" type="submit" variant="secondary">Cerrar sesión</Button></form></div></div></details>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[96rem] px-5 py-8 sm:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
