import Link from "next/link";

import { BrandLogo } from "@/components/atoms/BrandLogo";
import { NavigationLinks } from "@/components/molecules/NavigationLinks";
import { UserMenu } from "@/components/organisms/UserMenu";
import { PUBLIC_NAVIGATION } from "@/config/navigation";
import { getCurrentAccount } from "@/features/auth/queries/get-current-account";

export async function PublicHeader() {
  const account = await getCurrentAccount();
  return (
    <header className="sticky top-0 z-40 border-b border-cci-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
        <Link aria-label="Ir al inicio" href="/">
          <BrandLogo className="w-40 sm:w-44" preload />
        </Link>
        <div className="hidden items-center gap-4 lg:flex">
          <nav aria-label="Navegación principal">
            <NavigationLinks items={PUBLIC_NAVIGATION} />
          </nav>
          <UserMenu account={account} />
        </div>
        <details className="group relative lg:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-cci-200 px-3 text-sm font-semibold text-cci-950 marker:content-none">
            <span aria-hidden="true" className="text-lg leading-none">☰</span>
            Menú
          </summary>
          <div className="absolute right-0 top-14 w-[min(20rem,calc(100vw-2.5rem))] rounded-2xl border border-cci-100 bg-white p-4 shadow-xl">
            <nav aria-label="Navegación principal móvil">
              <NavigationLinks items={PUBLIC_NAVIGATION} />
            </nav>
            <div className="mt-4 border-t border-cci-100 pt-4">
              <UserMenu account={account} />
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
