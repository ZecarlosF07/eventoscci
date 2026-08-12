import {
  ACTIVITY_MODALITY_LABELS,
  ACTIVITY_STATUS_LABELS,
} from "@/features/activities/constants/activity.constants";
import type {
  ActivityDateRow,
  ActivityModality,
  ActivityStatus,
} from "@/features/activities/types/activity.types";
import { getPublicEnv } from "@/lib/env/public-env";

const DATE_FORMATTER = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Lima",
});

const MONEY_FORMATTER = new Intl.NumberFormat("es-PE", {
  currency: "PEN",
  style: "currency",
});

export function formatActivityDate(value: string): string {
  return DATE_FORMATTER.format(new Date(value));
}

export function formatDateTimeLocal(value: string | null): string {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone: "America/Lima",
    year: "numeric",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export function toDatabaseTimestamp(value: string): string {
  if (!value || /(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return value;
  return `${value}:00-05:00`;
}

export function formatActivityPrice(value: number): string {
  return MONEY_FORMATTER.format(value);
}

export function getNextActivityDate(dates: ActivityDateRow[]): ActivityDateRow | null {
  const activeDates = dates
    .filter((date) => !date.deleted_at)
    .sort((first, second) => first.starts_at.localeCompare(second.starts_at));
  const upcoming = activeDates.find((date) => new Date(date.starts_at) >= new Date());

  return upcoming ?? activeDates[0] ?? null;
}

export function getActivityBannerUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const { supabaseUrl } = getPublicEnv();
  return `${supabaseUrl}/storage/v1/object/public/activity-images/${path}`;
}

export function getModalityLabel(modality: ActivityModality): string {
  return ACTIVITY_MODALITY_LABELS[modality];
}

export function getStatusLabel(status: ActivityStatus): string {
  return ACTIVITY_STATUS_LABELS[status];
}
