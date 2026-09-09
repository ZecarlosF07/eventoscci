export type AnalyticsEventName =
  | "content_viewed"
  | "registration_completed"
  | "registration_cta_clicked"
  | "registration_started";

export type AnalyticsParameterValue = boolean | number | string;

export interface SafeAnalyticsEvent {
  name: AnalyticsEventName;
  parameters: Record<string, AnalyticsParameterValue>;
}

export interface GoogleAnalyticsProps {
  measurementId?: string;
}
