"use client";

import { useSearchParams } from "next/navigation";

import type { MoreFiltersProps } from "@/features/admin-filters/types/admin-filter.types";

export function MoreFilters({ children, names }: MoreFiltersProps) {
  const params = useSearchParams();
  const count = names.filter((name) => { const value = params.get(name); return value && value !== "all"; }).length;
  return <details className="col-span-full rounded-xl border border-cci-100 p-3" open={count > 0 ? true : undefined}>
    <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold">Más filtros{count ? ` · ${count} activos` : ""}</summary>
    <div className="mt-3 grid gap-4 sm:grid-cols-2">{children}</div>
  </details>;
}
