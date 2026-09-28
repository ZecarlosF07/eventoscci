"use client";

import { usePathname, useSearchParams } from "next/navigation";

/** Local catalogs update immediately without fetching a server page. Next syncs native history. */
export function useLocalFilters() {
  const params = useSearchParams();
  const pathname = usePathname();
  function change(values: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [name, value] of Object.entries(values)) {
      if (value && value !== "all") next.set(name, value);
      else next.delete(name);
    }
    next.delete("pagina");
    const query = next.toString();
    window.history.replaceState(null, "", `${pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  }
  return { params, change };
}
