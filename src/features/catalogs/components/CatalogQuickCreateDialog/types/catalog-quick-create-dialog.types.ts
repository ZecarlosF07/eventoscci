import type { CatalogKind, CatalogOption } from "@/features/catalogs/types/catalog.types";

export interface CatalogQuickCreateDialogProps {
  kind: CatalogKind;
  onCreated: (option: CatalogOption) => void;
}

export interface QuickCatalogFieldsProps {
  errors?: Record<string, string[]>;
  kind: CatalogKind;
}
