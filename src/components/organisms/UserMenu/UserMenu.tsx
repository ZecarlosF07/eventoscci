import Link from "next/link";

import { Button } from "@/components/atoms/Button";
import type { UserMenuProps } from "@/components/organisms/UserMenu/types/user-menu.types";
import { ROUTES } from "@/constants/routes";
import { logoutAction } from "@/features/auth/mutations/auth.actions";
import { classNames } from "@/utils/class-names";

const CAMPUS_LOGIN_HREF = `${ROUTES.login}?next=${encodeURIComponent(ROUTES.campus)}`;
const CAMPUS_REGISTER_HREF = `${ROUTES.register}?next=${encodeURIComponent(ROUTES.campus)}`;

export function UserMenu({ account, layout = "desktop", onNavigate, tone = "default" }: UserMenuProps) {
  if (!account?.isActive) {
    return (
      <div className={classNames("flex gap-2", layout === "mobile" ? "flex-col" : "items-center")}>
        <Link
          className={classNames(
            "inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime",
            layout === "mobile" && "border border-cci-200 text-cci-800 hover:bg-cci-50",
            layout === "desktop" && tone === "default" && "text-cci-800 hover:bg-cci-50",
            layout === "desktop" && tone === "inverse" && "text-white/80 hover:bg-white/10 hover:text-white",
          )}
          href={CAMPUS_REGISTER_HREF}
          onClick={onNavigate}
        >
          Crear cuenta
        </Link>
        <Link
          className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cci-lime px-4 text-sm font-bold text-cci-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime motion-reduce:transform-none"
          href={CAMPUS_LOGIN_HREF}
          onClick={onNavigate}
        >
          Ingresar al Campus <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    );
  }

  const destination = account.role === "student" ? ROUTES.campus : ROUTES.admin;
  const destinationLabel = account.role === "student" ? "Mi Campus" : "Administración";
  const initials = `${account.firstName.charAt(0)}${account.lastName.charAt(0)}`.toUpperCase();

  if (layout === "mobile") {
    return <div className="space-y-4">
      <div className="rounded-2xl bg-cci-50 p-4"><p className="font-semibold text-cci-950">{account.firstName} {account.lastName}</p><p className="mt-1 break-all text-sm text-slate-500">{account.email}</p></div>
      <Link className="flex min-h-11 items-center justify-center rounded-xl bg-cci-lime px-4 text-sm font-bold text-cci-950" href={destination} onClick={onNavigate}>{destinationLabel} →</Link>
      {account.role === "student" ? <Link className="flex min-h-11 items-center justify-center rounded-xl border border-cci-200 text-sm font-semibold text-cci-800" href={ROUTES.campusProfile} onClick={onNavigate}>Mi perfil</Link> : null}
      <form action={logoutAction}><Button className="w-full" type="submit" variant="secondary">Cerrar sesión</Button></form>
    </div>;
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cci-lime px-4 text-sm font-bold text-cci-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime motion-reduce:transform-none"
        href={destination}
      >
        {destinationLabel} <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
      </Link>
      <details className="group relative">
        <summary aria-label={`Abrir menú de ${account.firstName}`} className={classNames("flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl px-2 marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime", tone === "inverse" ? "text-white hover:bg-white/10" : "text-cci-950 hover:bg-cci-50")}>
          <span aria-hidden="true" className={classNames("grid size-9 place-items-center rounded-full text-xs font-bold", tone === "inverse" ? "bg-white/15 text-white" : "bg-cci-100 text-cci-800")}>{initials}</span>
          <span className="max-w-24 truncate text-sm font-semibold">{account.firstName}</span>
          <span aria-hidden="true" className="text-xs transition-transform group-open:rotate-180">⌄</span>
        </summary>
        <div className="absolute right-0 top-13 w-64 rounded-2xl border border-cci-100 bg-white p-3 text-cci-950 shadow-xl">
          <div className="border-b border-cci-100 px-2 pb-3"><p className="font-semibold">{account.firstName} {account.lastName}</p><p className="mt-1 truncate text-xs text-slate-500">{account.email}</p></div>
          {account.role === "student" ? <Link className="mt-2 flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold hover:bg-cci-50" href={ROUTES.campusProfile}>Mi perfil</Link> : null}
          <form action={logoutAction} className="mt-2"><Button className="w-full" type="submit" variant="subtle">Cerrar sesión</Button></form>
        </div>
      </details>
    </div>
  );
}
