import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { CatalogAdminList } from "@/features/catalogs/components/CatalogAdminList";
import { CATALOG_DESCRIPTIONS, CATALOG_TITLES, getCatalogKind } from "@/features/catalogs/constants/catalog.constants";
import { getAdminCatalogItems } from "@/features/catalogs/queries/get-admin-catalog";
import type { CatalogPageProps } from "@/features/catalogs/types/catalog.types";

export default async function CatalogListPage({ params }: CatalogPageProps) {
  const { kind: segment } = await params;
  const kind = getCatalogKind(segment);
  if (!kind) notFound();
  const items = await getAdminCatalogItems(kind);
  return <div className="space-y-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><SectionHeading description={CATALOG_DESCRIPTIONS[kind]} eyebrow="Catálogos" title={CATALOG_TITLES[kind]} /><Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cci-950 px-4 py-2 text-sm font-semibold text-white hover:bg-cci-800" href={`/admin/catalogos/${segment}/nuevo`}>Nuevo registro</Link></div><CatalogAdminList items={items} kind={kind} /></div>;
}
