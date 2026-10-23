import type { ReactNode } from "react";

import type { CatalogKind, CatalogRecord } from "@/features/catalogs/types/catalog.types";
import type { QuickCatalogResult, SpeakerAdminRecord } from "@/features/catalogs/types/catalog.types";

export interface CatalogFormProps {
  action?: (previous: QuickCatalogResult, formData: FormData) => Promise<QuickCatalogResult>;
  inlineDocument?: boolean;
  onDocumentSaved?: () => void;
  onPendingChange?: (pending: boolean) => void;
  onSaved?: () => void;
  kind: CatalogKind;
  record?: CatalogRecord | null;
}

export interface CatalogFormFieldsProps extends CatalogFormProps {
  contactFirst?: boolean;
  errors?: Record<string, string[]>;
}

export interface SpeakerCatalogFieldsProps {
  activeControl: ReactNode;
  contactFirst?: boolean;
  errors?: Record<string, string[]>;
  speaker?: SpeakerAdminRecord;
}

export interface ActiveFieldProps {
  value: boolean;
}
