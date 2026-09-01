import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { CatalogForm } from "@/features/catalogs/components/CatalogForm";
import { CATALOG_TITLES, getCatalogKind } from "@/features/catalogs/constants/catalog.constants";
import { getAdminCatalogRecord } from "@/features/catalogs/queries/get-admin-catalog";
import type { CatalogEditPageProps } from "@/features/catalogs/types/catalog.types";

export default async function CatalogEditPage({ params }: CatalogEditPageProps) {
  const { id, kind: segment } = await params;
  const kind = getCatalogKind(segment);
  if (!kind) notFound();
  const isNew = id === "nuevo";
  const record = isNew ? null : await getAdminCatalogRecord(kind, id);
  if (!isNew && !record) notFound();
  return <div className="space-y-7"><SectionHeading description="Los cambios se reflejarán en los contenidos vinculados." eyebrow={CATALOG_TITLES[kind]} title={isNew ? "Nuevo registro" : "Editar registro"} /><CatalogForm kind={kind} record={record} /></div>;
}
