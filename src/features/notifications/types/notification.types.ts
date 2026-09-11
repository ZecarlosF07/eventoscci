import type { Enums, Json } from "@/lib/supabase/database.types";

export type NotificationStatus = Enums<"notification_status">;

export type NotificationEventType =
  | "activity_certificate_issued"
  | "activity_certificate_offer"
  | "activity_certificate_request_created"
  | "activity_free_registration_confirmed"
  | "activity_paid_preregistration_created"
  | "activity_paid_registration_confirmed"
  | "activity_virtual_session_reminder"
  | "course_certificate_issued";

export type NotificationEntityType =
  | "activity_virtual_reminder"
  | "certificate"
  | "registration";

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

export interface ScheduledNotificationBatchResult {
  claimed: number;
  failed: number;
  sent: number;
}
