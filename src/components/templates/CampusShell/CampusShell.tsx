import Link from "next/link";

import { BrandLogo } from "@/components/atoms/BrandLogo";
import { Button } from "@/components/atoms/Button";
import { NavigationLinks } from "@/components/molecules/NavigationLinks";
import { Text } from "@/components/atoms/Text";
import type { CampusShellProps } from "@/components/templates/CampusShell/types/campus-shell.types";
import { CAMPUS_NAVIGATION } from "@/config/navigation";
import { ROUTES } from "@/constants/routes";
import { logoutAction } from "@/features/auth/mutations/auth.actions";

export function CampusShell({ account, children }: CampusShellProps) {
  return <div className="min-h-screen bg-cci-50">
    <header className="sticky top-0 z-40 border-b border-cci-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-7">
          <Link aria-label="Ir al inicio del Campus" href={ROUTES.campus}><BrandLogo className="w-36 sm:w-40" /></Link>
          <nav aria-label="Navegación del Campus" className="hidden lg:block"><NavigationLinks items={CAMPUS_NAVIGATION} variant="workspace" /></nav>
        </div>
        <div className="hidden items-center gap-3 lg:flex"><Text size="sm">{account.person.first_names} {account.person.last_names}</Text><form action={logoutAction}><Button type="submit" variant="secondary">Cerrar sesión</Button></form></div>
        <details className="relative lg:hidden"><summary className="flex min-h-11 cursor-pointer list-none items-center rounded-xl border border-cci-200 px-3 text-sm font-semibold marker:content-none">☰ Menú</summary><div className="absolute right-0 top-14 max-h-[calc(100dvh-6rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-2xl border border-cci-100 bg-white p-4 shadow-xl"><nav aria-label="Navegación móvil del Campus"><NavigationLinks items={CAMPUS_NAVIGATION} variant="workspace" /></nav><div className="mt-4 border-t border-cci-100 pt-4"><Text size="sm">{account.person.first_names} {account.person.last_names}</Text><form action={logoutAction} className="mt-3"><Button className="w-full" type="submit" variant="secondary">Cerrar sesión</Button></form></div></div></details>
      </div>
    </header>
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">{children}</main>
  </div>;
}
