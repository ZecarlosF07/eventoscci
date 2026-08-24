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
    active: "bg-cci-100 text-cci-950",
    base: "text-slate-600 hover:bg-cci-50 hover:text-cci-950",
    list: "flex flex-col gap-1 lg:flex-row",
  },
  workspace: {
    active: "bg-cci-950 text-white",
    base: "text-slate-600 hover:bg-cci-100 hover:text-cci-950",
    list: "flex flex-col gap-1 md:flex-row",
  },
} as const;

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavigationLinks({
  items,
  variant = "public",
}: NavigationLinksProps) {
  const pathname = usePathname();
  const styles = VARIANT_STYLES[variant];

  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              aria-current={active ? "page" : undefined}
              className={classNames(
                "flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                active ? styles.active : styles.base,
              )}
              href={item.href}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
