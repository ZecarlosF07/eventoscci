import type { CatalogAdminItem, CatalogKind } from "@/features/catalogs/types/catalog.types";

export interface CatalogAdminListProps {
  items: CatalogAdminItem[];
  kind: CatalogKind;
}
