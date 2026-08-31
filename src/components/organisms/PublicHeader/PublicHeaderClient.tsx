"use client";

import Link from "next/link";

import { BrandLogo } from "@/components/atoms/BrandLogo";
import { NavigationLinks } from "@/components/molecules/NavigationLinks";
import { usePublicHeader } from "@/components/organisms/PublicHeader/hooks/use-public-header";
import type { PublicHeaderClientProps } from "@/components/organisms/PublicHeader/types/public-header.types";
import { PublicMobileMenu } from "@/components/organisms/PublicMobileMenu";
import { UserMenu } from "@/components/organisms/UserMenu";
import { PUBLIC_NAVIGATION } from "@/config/navigation";
import { ROUTES } from "@/constants/routes";
import { classNames } from "@/utils/class-names";

export function PublicHeaderClient({ account }: PublicHeaderClientProps) {
  const {
    closeButtonRef,
    closeMenu,
    isMenuOpen,
    isScrolled,
    menuButtonRef,
    openMenu,
    panelRef,
  } = usePublicHeader();
  const tone = isScrolled ? "inverse" : "default";

  return (
    <header
      className={classNames(
        "sticky top-0 z-40 border-b backdrop-blur transition-[background-color,border-color,box-shadow] duration-300 motion-reduce:transition-none",
        isScrolled
          ? "border-cci-800 bg-cci-950/97 shadow-lg shadow-cci-950/15"
          : "border-cci-100 bg-white/95",
      )}
    >
      <div className="relative mx-auto grid min-h-18 w-full max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-7 lg:px-8">
        <Link
          aria-label="Ir al inicio"
          className="w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cci-lime"
          href={ROUTES.home}
        >
          <BrandLogo className="w-36 sm:w-40" light={isScrolled} preload />
        </Link>
        <nav aria-label="Navegación principal" className="hidden lg:block">
          <NavigationLinks items={PUBLIC_NAVIGATION} tone={tone} />
        </nav>
        <div className="hidden justify-self-end lg:block">
          <UserMenu account={account} tone={tone} />
        </div>
        <PublicMobileMenu
          account={account}
          closeButtonRef={closeButtonRef}
          isOpen={isMenuOpen}
          menuButtonRef={menuButtonRef}
          onClose={closeMenu}
          onOpen={openMenu}
          panelRef={panelRef}
          tone={tone}
        />
      </div>
      <span aria-hidden="true" className={classNames("absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cci-lime to-transparent transition-opacity", isScrolled ? "opacity-60" : "opacity-0")} />
    </header>
  );
}
