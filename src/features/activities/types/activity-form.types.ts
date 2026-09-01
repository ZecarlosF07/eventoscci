import type {
  ActivityDetail,
  ActivityModality,
  ActivityStatus,
  ActivityType,
} from "@/features/activities/types/activity.types";
import type {
  ActivityContactSummary,
  VenueSummary,
} from "@/features/catalogs/types/catalog.types";
import type { SpeakerSummary } from "@/features/speakers/types/speaker.types";

export interface ActivityDateInput {
  ends_at: string;
  label: string;
  sort_order: number;
  starts_at: string;
}

export interface ActivitySpeakerInput {
  role_label: string;
  sort_order: number;
  speaker_id: string;
}

export interface ActivityFormInput {
  academic_hours: string;
  additional_info: string;
  banner_path: string;
  capacity: string;
  category_id: string;
  contact_id: string;
  dates: ActivityDateInput[];
  description: string;
  duration_text: string;
  general_price: string;
  id: string;
  is_free: boolean;
  member_price: string;
  members_only: boolean;
  modality: ActivityModality;
  objective: string;
  program: string;
  program_image_paths: string[];
  registration_close_at: string;
  registration_open_at: string;
  registrations_closed_manually: boolean;
  short_description: string;
  slug: string;
  speakers: ActivitySpeakerInput[];
  status: ActivityStatus;
  syllabus: string;
  target_audience: string;
  title: string;
  type: ActivityType;
  venue_id: string;
  virtual_url: string;
}

export interface ActivityFormState {
  errors?: Record<string, string[]>;
  message?: string;
  savedId?: string;
  success?: boolean;
  warning?: boolean;
}

export interface ActivityFormProps {
  activity?: ActivityDetail;
  contacts: ActivityContactSummary[];
  categories: Array<{ id: string; name: string }>;
  speakers: SpeakerSummary[];
  type: ActivityType;
  venues: VenueSummary[];
}
