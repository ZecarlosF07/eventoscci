import Link from "next/link";

import { Button } from "@/components/atoms/Button";
import { Text } from "@/components/atoms/Text";
import type { CampusShellProps } from "@/components/templates/CampusShell/types/campus-shell.types";
import { ROUTES } from "@/constants/routes";
import { logoutAction } from "@/features/auth/mutations/auth.actions";

export function CampusShell({ account, children }: CampusShellProps) {
  return <div className="min-h-screen bg-slate-100">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex flex-wrap items-center gap-4">
          <Link className="font-semibold text-slate-950" href={ROUTES.campus}>Campus Virtual CCI</Link>
          <nav aria-label="Navegación del Campus"><ul className="flex gap-1"><li><Link className="inline-flex rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100" href={ROUTES.campus}>Inicio</Link></li><li><Link className="inline-flex rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100" href={ROUTES.campusCourses}>Mis cursos</Link></li><li><Link className="inline-flex rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100" href={ROUTES.campusProfile}>Mi perfil</Link></li></ul></nav>
        </div>
        <div className="flex items-center gap-3"><Text size="sm">{account.person.first_names} {account.person.last_names}</Text><form action={logoutAction}><Button type="submit" variant="secondary">Cerrar sesión</Button></form></div>
      </div>
    </header>
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">{children}</main>
  </div>;
}
