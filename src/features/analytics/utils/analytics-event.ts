import type {
  AnalyticsEventName,
  AnalyticsParameterValue,
  SafeAnalyticsEvent,
} from "@/features/analytics/types/analytics.types";

const ALLOWED_PARAMETERS = new Set([
  "activity_id",
  "activity_type",
  "content_path",
  "content_type",
  "is_free",
  "registration_type",
]);

export function buildSafeAnalyticsEvent(
  name: AnalyticsEventName,
  parameters: Record<string, AnalyticsParameterValue>,
): SafeAnalyticsEvent {
  const safeParameters = Object.fromEntries(
    Object.entries(parameters)
      .filter(([key]) => ALLOWED_PARAMETERS.has(key))
      .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 120) : value]),
  );
  return { name, parameters: safeParameters };
}
