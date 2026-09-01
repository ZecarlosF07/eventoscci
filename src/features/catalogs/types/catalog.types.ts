import type { Tables } from "@/lib/supabase/database.types";

export type CatalogKind = "categories" | "contacts" | "speakers" | "venues";

export type Venue = Tables<"venues">;
export type ActivityContact = Tables<"activity_contacts">;
export type SpeakerPrivateDetails = Tables<"speaker_private_details">;
export type CategoryRecord = Tables<"categories">;
export type SpeakerRecord = Tables<"speakers">;

export type SpeakerAdminRecord = SpeakerRecord & {
  private_details: SpeakerPrivateDetails | null;
};

export type CatalogRecord = ActivityContact | CategoryRecord | SpeakerAdminRecord | Venue;

export type VenueSummary = Pick<
  Venue,
  "address" | "id" | "is_active" | "maps_embed_url" | "name" | "reference"
>;

export type ActivityContactSummary = Pick<
  ActivityContact,
  "contact_name" | "email" | "id" | "is_active" | "is_default" | "label" | "whatsapp_phone"
>;

export interface CatalogOption {
  description?: string;
  id: string;
  imageUrl?: string | null;
  label: string;
}

export interface QuickCatalogResult {
  errors?: Record<string, string[]>;
  message?: string;
  option?: CatalogOption;
  success?: boolean;
}

export interface CatalogAdminItem {
  description?: string | null;
  id: string;
  isActive: boolean;
  label: string;
  meta?: string | null;
  usageCount: number;
}

export interface CatalogPageProps {
  params: Promise<{ kind: string }>;
}

export interface CatalogEditPageProps {
  params: Promise<{ id: string; kind: string }>;
}
