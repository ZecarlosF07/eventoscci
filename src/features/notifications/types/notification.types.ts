import type { Enums, Json } from "@/lib/supabase/database.types";

export type NotificationStatus = Enums<"notification_status">;

export type NotificationEventType =
  | "activity_certificate_issued"
  | "activity_free_registration_confirmed"
  | "activity_paid_preregistration_created"
  | "activity_paid_registration_confirmed"
  | "course_certificate_issued";

export type NotificationEntityType = "certificate" | "registration";

export interface NotificationReference {
  eventType: NotificationEventType;
  relatedEntityId: string;
  relatedEntityType: NotificationEntityType;
}

export interface NotificationItem {
  attempts: number;
  created_at: string;
  event_type: string;
  id: string;
  last_error: string | null;
  next_attempt_at: string | null;
  payload: Json;
  recipient_email: string;
  sent_at: string | null;
  status: NotificationStatus;
}

export interface NotificationPage {
  notifications: NotificationItem[];
  page: number;
  pageCount: number;
  total: number;
}

export interface NotificationsAdminPageProps {
  searchParams: Promise<{ pagina?: string | string[] }>;
}
