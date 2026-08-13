import Link from "next/link";

import { Text } from "@/components/atoms/Text";
import type { PaginationProps } from "@/components/molecules/Pagination/types/pagination.types";

function pageUrl(pathname: string, page: number, values?: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(values ?? {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  if (page > 1) params.set("pagina", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function Pagination({ page, pageCount, pathname, searchParams }: PaginationProps) {
  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-4">
      <Text size="sm">Página {page} de {pageCount}</Text>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold" href={pageUrl(pathname, page - 1, searchParams)}>Anterior</Link>
        ) : null}
        {page < pageCount ? (
          <Link className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold" href={pageUrl(pathname, page + 1, searchParams)}>Siguiente</Link>
        ) : null}
      </div>
    </nav>
  );
}
