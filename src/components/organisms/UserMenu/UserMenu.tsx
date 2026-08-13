import Link from "next/link";

import { Button } from "@/components/atoms/Button";
import type { UserMenuProps } from "@/components/organisms/UserMenu/types/user-menu.types";
import { ROUTES } from "@/constants/routes";
import { logoutAction } from "@/features/auth/mutations/auth.actions";

export function UserMenu({ account }: UserMenuProps) {
  if (!account?.isActive) return <div className="flex items-center gap-2"><Link className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100" href={ROUTES.login}>Iniciar sesión</Link><Link className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white" href={ROUTES.register}>Crear cuenta</Link></div>;
  return <div className="flex flex-wrap items-center gap-2"><span className="text-sm text-slate-600">{account.person.first_names}</span><Link className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" href={account.role === "student" ? ROUTES.campus : ROUTES.admin}>{account.role === "student" ? "Mi Campus" : "Administración"}</Link><form action={logoutAction}><Button type="submit" variant="subtle">Salir</Button></form></div>;
}
