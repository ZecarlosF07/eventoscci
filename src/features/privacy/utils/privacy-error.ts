import { PRIVACY_ERRORS } from "@/features/privacy/constants/privacy.constants";

export function getPrivacyError(message: string): string | undefined {
  if (message.includes("PRIVACY_POLICY_CHANGED")) return PRIVACY_ERRORS.PRIVACY_POLICY_CHANGED;
  if (message.includes("PRIVACY_CONSENT_REQUIRED")) return PRIVACY_ERRORS.PRIVACY_CONSENT_REQUIRED;
  return undefined;
}
