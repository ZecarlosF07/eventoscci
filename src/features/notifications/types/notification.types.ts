import type { Enums, Json } from "@/lib/supabase/database.types";

export type NotificationStatus = Enums<"notification_status">;

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

export interface NotificationDeliveryResult {
  failed: number;
  processed: number;
  sent: number;
}

export interface NotificationsAdminPageProps {
  searchParams: Promise<{ pagina?: string | string[] }>;
}
