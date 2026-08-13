import Link from "next/link";

import { UserMenu } from "@/components/organisms/UserMenu";
import { PUBLIC_NAVIGATION } from "@/config/navigation";
import { SITE_CONFIG } from "@/config/site";
import { getCurrentAccount } from "@/features/auth/queries/get-current-account";

export async function PublicHeader() {
  const account = await getCurrentAccount();
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link
          className="flex items-center gap-3 font-semibold text-slate-950"
          href="/"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-sm text-white">
            CCI
          </span>
          <span>{SITE_CONFIG.name}</span>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <nav aria-label="Navegación principal">
            <ul className="flex flex-wrap gap-1">
            {PUBLIC_NAVIGATION.map((item) => (
              <li key={item.href}>
                <Link
                  className="inline-flex rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            </ul>
          </nav>
          <UserMenu account={account} />
        </div>
      </div>
    </header>
  );
}
