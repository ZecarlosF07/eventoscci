import type { CatalogKind, CatalogOption } from "@/features/catalogs/types/catalog.types";

export interface CatalogSelectProps {
  defaultValue?: string;
  error?: string;
  kind: CatalogKind;
  label: string;
  name: string;
  options: CatalogOption[];
  required?: boolean;
}
