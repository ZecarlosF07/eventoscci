"use client";

import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";

import type { MoreFiltersProps } from "@/features/admin-filters/types/admin-filter.types";

export function MoreFilters({ children, names, toolbar, defaults = {} }: MoreFiltersProps) {
  const params = useSearchParams();
  const panelId = useId();
  const [expanded, setExpanded] = useState<boolean>();
  const count = names.filter((name) => {
    const value = params.get(name) ?? defaults[name];
    return value && value !== defaults[name] && (value !== "all" || Boolean(defaults[name] && defaults[name] !== "all"));
  }).length;
  const isExpanded = expanded ?? count > 0;
  return <div className="col-span-full">
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <button aria-controls={panelId} aria-expanded={isExpanded} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-cci-800 hover:bg-cci-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-600" onClick={() => setExpanded(!isExpanded)} type="button">
        Más filtros{count ? ` · ${count} ${count === 1 ? "activo" : "activos"}` : ""}<span aria-hidden="true">{isExpanded ? "−" : "+"}</span>
      </button>
      {toolbar}
    </div>
    <div className={`${isExpanded ? "grid" : "hidden"} gap-3 border-t border-cci-100 pt-2 sm:grid-cols-2`} id={panelId}>{children}</div>
  </div>;
}
