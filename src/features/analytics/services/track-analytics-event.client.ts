"use client";

import type { AnalyticsEventName, AnalyticsParameterValue } from "@/features/analytics/types/analytics.types";
import { buildSafeAnalyticsEvent } from "@/features/analytics/utils/analytics-event";

export function trackAnalyticsEvent(
  name: AnalyticsEventName,
  parameters: Record<string, AnalyticsParameterValue>,
): void {
  if (typeof window === "undefined" || !window.gtag) return;
  const event = buildSafeAnalyticsEvent(name, parameters);
  window.gtag("event", event.name, event.parameters);
}
