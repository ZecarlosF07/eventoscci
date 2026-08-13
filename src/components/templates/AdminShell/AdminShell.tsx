import Link from "next/link";

import { Button } from "@/components/atoms/Button";
import { Text } from "@/components/atoms/Text";
import type { AdminShellProps } from "@/components/templates/AdminShell/types/admin-shell.types";
import { ADMIN_NAVIGATION } from "@/config/navigation";
import { ROUTES } from "@/constants/routes";
import { logoutAction } from "@/features/auth/mutations/auth.actions";

export function AdminShell({ children, email, name }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <Link className="font-semibold text-slate-950" href={ROUTES.admin}>
              CCI Administración
            </Link>
            <nav aria-label="Navegación administrativa">
              <ul className="flex flex-wrap gap-1">
                {ADMIN_NAVIGATION.map((item) => (
                  <li key={item.href}>
                    <Link
                      className="inline-flex rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div><Text size="sm">{name}</Text><Text size="sm">{email}</Text></div>
            <form action={logoutAction}>
              <Button type="submit" variant="secondary">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-5 py-10 lg:px-8">{children}</main>
    </div>
  );
}
