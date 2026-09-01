"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Text } from "@/components/atoms/Text";
import type { CatalogAdminListProps } from "@/features/catalogs/components/CatalogAdminList/types/catalog-admin-list.types";
import { CATALOG_ROUTE_SEGMENTS } from "@/features/catalogs/constants/catalog.constants";
import { deleteUnusedCatalogAction, setCatalogActiveAction } from "@/features/catalogs/mutations/catalog.actions";

export function CatalogAdminList({ items, kind }: CatalogAdminListProps) {
  const basePath = `/admin/catalogos/${CATALOG_ROUTE_SEGMENTS[kind]}`;
  const [query, setQuery] = useState("");
  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    if (!normalized) return items;
    return items.filter((item) => [item.label, item.description, item.meta].filter(Boolean).join(" ").toLocaleLowerCase("es").includes(normalized));
  }, [items, query]);
  if (!items.length) return <div className="rounded-3xl border border-dashed border-cci-200 bg-white p-10 text-center"><Text>Aún no hay registros en este catálogo.</Text></div>;

  return (
    <div className="space-y-4">
      <div className="max-w-md"><label className="sr-only" htmlFor="catalog-search">Buscar en el catálogo</label><Input id="catalog-search" onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o información" type="search" value={query} /></div>
    <div className="overflow-hidden rounded-3xl border border-cci-100 bg-white shadow-sm">
      <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_100px_140px] gap-4 border-b border-cci-100 bg-cci-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-cci-700 md:grid">
        <span>Registro</span><span>Información</span><span>Usos</span><span className="text-right">Acciones</span>
      </div>
      {visibleItems.map((item) => (
        <article className="grid gap-4 border-b border-cci-100 p-5 last:border-b-0 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_100px_140px] md:items-center" key={item.id}>
          <div><div className="flex flex-wrap items-center gap-2"><strong className="text-cci-950">{item.label}</strong><Badge variant={item.isActive ? "success" : "neutral"}>{item.isActive ? "Activo" : "Inactivo"}</Badge></div>{item.description ? <Text className="mt-1" size="sm">{item.description}</Text> : null}</div>
          <Text size="sm">{item.meta || "—"}</Text>
          <Text className="font-semibold" size="sm">{item.usageCount}</Text>
          <div className="flex flex-wrap justify-end gap-2">
            <Link className="inline-flex min-h-10 items-center rounded-xl border border-cci-200 px-3 text-sm font-semibold text-cci-950 hover:bg-cci-50" href={`${basePath}/${item.id}`}>Editar</Link>
            <form action={setCatalogActiveAction.bind(null, kind, item.id, !item.isActive)}><Button className="min-h-10 px-3" type="submit" variant="subtle">{item.isActive ? "Desactivar" : "Activar"}</Button></form>
            {!item.usageCount ? <form action={deleteUnusedCatalogAction.bind(null, kind, item.id)}><Button className="min-h-10 px-3 text-rose-700" type="submit" variant="subtle">Eliminar</Button></form> : null}
          </div>
        </article>
      ))}
      {!visibleItems.length ? <div className="p-8 text-center"><Text>No hay resultados para “{query}”.</Text></div> : null}
    </div>
    </div>
  );
}
