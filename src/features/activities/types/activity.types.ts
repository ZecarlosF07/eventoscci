import type {
  Enums,
  Tables,
} from "@/lib/supabase/database.types";

export type ActivityType = Enums<"activity_type">;
export type ActivityModality = Enums<"activity_modality">;
export type ActivityStatus = Enums<"activity_status">;
export type ActivityRow = Tables<"activities">;
export type ActivityDateRow = Tables<"activity_dates">;

export type ActivityCategory = Pick<
  Tables<"categories">,
  "id" | "name" | "slug"
>;

export type ActivitySpeaker = Pick<
  Tables<"speakers">,
  | "bio"
  | "first_names"
  | "id"
  | "last_names"
  | "organization"
  | "photo_path"
  | "professional_title"
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
  dates: ActivityDateRow[];
  speakers: ActivitySpeaker[];
};

export interface ActivityFilters {
  category?: string;
  date?: string;
  modality?: ActivityModality;
  price?: "free" | "paid";
  query?: string;
}

export interface ActivityAdminFilters {
  page: number;
  query?: string;
  status?: ActivityStatus;
  type: ActivityType;
}

export interface ActivityAdminPage {
  activities: ActivityListItem[];
  page: number;
  pageCount: number;
  total: number;
}
