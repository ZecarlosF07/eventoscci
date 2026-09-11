import type { ActivityCertificateMode } from "@/features/activities/types/activity-certificate.types";
import type {
  Enums,
  Tables,
} from "@/lib/supabase/database.types";

export type ActivityType = Enums<"activity_type">;
export type ActivityModality = Enums<"activity_modality">;
export type ActivityStatus = Enums<"activity_status">;
export type ActivityAdminView = "active" | "archived";
export type ActivityRow = Omit<
  Tables<"activities">,
  "certificate_mode" | "virtual_url"
> & {
  certificate_mode: ActivityCertificateMode;
};
export type ActivityDateRow = Tables<"activity_dates">;

export type ActivityCategory = Pick<
  Tables<"categories">,
  "id" | "name" | "slug"
>;

export type ActivityVenue = Pick<
  Tables<"venues">,
  "address" | "id" | "maps_embed_url" | "name" | "reference"
>;

export type ActivityContact = Pick<
  Tables<"activity_contacts">,
  "contact_name" | "email" | "id" | "label" | "whatsapp_phone"
>;

export type ActivitySpeaker = Pick<
  Tables<"speakers">,
  | "bio"
  | "first_names"
  | "id"
  | "linkedin_url"
  | "last_names"
  | "organization"
  | "photo_path"
  | "professional_title"
  | "specialties"
  | "website_url"
> & {
  roleLabel: string | null;
  sortOrder: number;
};

export type ActivityListItem = Pick<
  ActivityRow,
  | "banner_path"
  | "capacity"
  | "general_price"
  | "id"
  | "is_free"
  | "member_price"
  | "members_only"
  | "modality"
  | "published_at"
  | "registration_close_at"
  | "registration_open_at"
  | "registrations_closed_manually"
  | "short_description"
  | "slug"
  | "status"
  | "title"
  | "type"
> & {
  category: ActivityCategory | null;
  dates: ActivityDateRow[];
};

export type ActivityDetail = ActivityRow & {
  category: ActivityCategory | null;
  contact: ActivityContact | null;
  dates: ActivityDateRow[];
  speakers: ActivitySpeaker[];
  venue: ActivityVenue | null;
};

export type ActivityAdminDetail = ActivityDetail & {
  virtual_url: string | null;
};

export interface ActivityFilters {
  category?: string;
  date?: string;
  modality?: ActivityModality;
  price?: "free" | "paid";
  query?: string;
  page: number;
}

export interface ActivityPublicPage {
  activities: ActivityListItem[];
  page: number;
  pageCount: number;
  total: number;
}

export interface ActivityAdminFilters {
  page: number;
  query?: string;
  status?: ActivityStatus;
  type: ActivityType;
  view: ActivityAdminView;
}

export interface ActivityAdminPage {
  activities: ActivityListItem[];
  archivedTotal: number;
  page: number;
  pageCount: number;
  total: number;
}
