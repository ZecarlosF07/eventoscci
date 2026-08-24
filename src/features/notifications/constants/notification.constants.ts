export const NOTIFICATION_SELECT =
  "id, event_type, recipient_email, payload, status, attempts, next_attempt_at, last_error, sent_at, created_at";

export const REGISTRATION_NOTIFICATION_EVENT_TYPES = [
  "activity_free_registration_confirmed",
  "activity_paid_preregistration_created",
] as const;

export const NOTIFICATION_WEBHOOK_TIMEOUT_MS = 15_000;
export const NOTIFICATION_ERROR_MAX_LENGTH = 2_000;
