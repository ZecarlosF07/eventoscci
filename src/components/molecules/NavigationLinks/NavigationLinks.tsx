"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavigationLinksProps } from "@/components/molecules/NavigationLinks/types/navigation-links.types";
import { classNames } from "@/utils/class-names";

const VARIANT_STYLES = {
  admin: {
    active: "bg-cci-lime text-cci-950",
    base: "text-white/75 hover:bg-white/10 hover:text-white",
    list: "space-y-1",
  },
  public: {
    active: "bg-cci-100 text-cci-950 after:bg-cci-lime",
    base: "text-slate-600 hover:bg-cci-50 hover:text-cci-950",
    list: "flex flex-col gap-1 lg:flex-row",
  },
  publicInverse: {
    active: "bg-white/10 text-white after:bg-cci-lime",
    base: "text-white/75 hover:bg-white/10 hover:text-white",
    list: "flex flex-col gap-1 lg:flex-row",
  },
  workspace: {
    active: "bg-cci-950 text-white",
    base: "text-slate-600 hover:bg-cci-100 hover:text-cci-950",
    list: "flex flex-col gap-1 lg:flex-row",
  },
} as const;

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavigationLinks({
  items,
  onNavigate,
  tone = "default",
  variant = "public",
}: NavigationLinksProps) {
  const pathname = usePathname();
  const styleKey = variant === "public" && tone === "inverse" ? "publicInverse" : variant;
  const styles = VARIANT_STYLES[styleKey];

  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              aria-current={active ? "page" : undefined}
              className={classNames(
                "relative flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:scale-x-0 after:rounded-full after:transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime",
                active && "after:scale-x-100",
                active ? styles.active : styles.base,
              )}
              href={item.href}
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
