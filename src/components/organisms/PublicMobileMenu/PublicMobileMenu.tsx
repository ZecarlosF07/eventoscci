"use client";

import { createPortal } from "react-dom";

import { BrandLogo } from "@/components/atoms/BrandLogo";
import { NavigationLinks } from "@/components/molecules/NavigationLinks";
import { UserMenu } from "@/components/organisms/UserMenu";
import type { PublicMobileMenuProps } from "@/components/organisms/PublicMobileMenu/types/public-mobile-menu.types";
import { PUBLIC_NAVIGATION } from "@/config/navigation";
import { classNames } from "@/utils/class-names";

export function PublicMobileMenu({
  account,
  closeButtonRef,
  isOpen,
  menuButtonRef,
  onClose,
  onOpen,
  panelRef,
  tone,
}: PublicMobileMenuProps) {
  const mobilePanel = isOpen ? createPortal(
    <div className="fixed inset-0 z-50">
      <button aria-label="Cerrar menú" className="absolute inset-0 bg-cci-950/60 backdrop-blur-sm" onClick={onClose} tabIndex={-1} type="button" />
      <aside
        aria-label="Menú principal"
        aria-modal="true"
        className="absolute inset-y-0 right-0 flex w-[min(22rem,calc(100vw-1rem))] flex-col overflow-y-auto bg-white shadow-2xl"
        id="public-mobile-navigation"
        ref={panelRef}
        role="dialog"
      >
        <div className="flex min-h-20 items-center justify-between gap-4 bg-cci-950 px-5">
          <BrandLogo className="w-36" light />
          <button
            aria-label="Cerrar menú"
            className="grid size-11 place-items-center rounded-xl border border-white/20 text-2xl text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <nav aria-label="Navegación principal móvil">
            <NavigationLinks items={PUBLIC_NAVIGATION} onNavigate={onClose} />
          </nav>
          <div className="mt-auto border-t border-cci-100 pt-5">
            <UserMenu account={account} layout="mobile" onNavigate={onClose} />
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  ) : null;

  return (
    <div className="justify-self-end lg:hidden">
      <button
        aria-controls="public-mobile-navigation"
        aria-expanded={isOpen}
        className={classNames(
          "inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime",
          tone === "inverse"
            ? "border-white/25 text-white hover:bg-white/10"
            : "border-cci-200 text-cci-950 hover:bg-cci-50",
        )}
        onClick={onOpen}
        ref={menuButtonRef}
        type="button"
      >
        <span aria-hidden="true" className="grid gap-1">
          <span className="h-0.5 w-4 rounded-full bg-current" />
          <span className="h-0.5 w-4 rounded-full bg-current" />
          <span className="h-0.5 w-4 rounded-full bg-current" />
        </span>
        Menú
      </button>

      {mobilePanel}
    </div>
  );
}
