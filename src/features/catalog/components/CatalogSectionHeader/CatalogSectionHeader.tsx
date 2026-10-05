import Link from "next/link";

import type { CatalogSectionHeaderProps } from "@/features/catalog/components/CatalogSectionHeader/types/catalog-section-header.types";

export function CatalogSectionHeader({ actionHref, actionLabel, description, eyebrow, id, title }: CatalogSectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="max-w-3xl">
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.12em] text-cci-600">{eyebrow}</p> : null}
        <h2 className={`${eyebrow ? "mt-1" : ""} text-xl font-semibold tracking-tight text-cci-950 sm:text-2xl`} id={id}>{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {actionHref && actionLabel ? <Link className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cci-200 bg-white px-4 py-2 text-sm font-semibold text-cci-800 transition hover:border-cci-500 hover:bg-cci-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cci-800" href={actionHref}>{actionLabel} <span aria-hidden="true">→</span></Link> : null}
    </div>
  );
}
