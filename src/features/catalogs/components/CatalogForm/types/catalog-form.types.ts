import type { CatalogKind, CatalogRecord } from "@/features/catalogs/types/catalog.types";

export interface CatalogFormProps {
  kind: CatalogKind;
  record?: CatalogRecord | null;
}

export interface CatalogFormFieldsProps extends CatalogFormProps {
  errors?: Record<string, string[]>;
}

export interface ActiveFieldProps {
  value: boolean;
}
