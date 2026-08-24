import Link from "next/link";

import { Button } from "@/components/atoms/Button";
import type { UserMenuProps } from "@/components/organisms/UserMenu/types/user-menu.types";
import { ROUTES } from "@/constants/routes";
import { logoutAction } from "@/features/auth/mutations/auth.actions";

export function UserMenu({ account }: UserMenuProps) {
  if (!account?.isActive) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-semibold text-cci-800 hover:bg-cci-50"
          href={ROUTES.login}
        >
          Iniciar sesión
        </Link>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cci-950 px-4 text-sm font-semibold text-white shadow-sm hover:bg-cci-800"
          href={ROUTES.register}
        >
          Crear cuenta
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="text-sm text-slate-600">Hola, {account.person.first_names}</span>
      <Link
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cci-950 px-4 text-sm font-semibold text-white"
        href={account.role === "student" ? ROUTES.campus : ROUTES.admin}
      >
        {account.role === "student" ? "Mi Campus" : "Administración"}
      </Link>
      <form action={logoutAction}>
        <Button className="w-full" type="submit" variant="subtle">Salir</Button>
      </form>
    </div>
  );
}
