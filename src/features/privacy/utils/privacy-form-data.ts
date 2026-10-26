import type { PrivacyInput } from "@/features/privacy/types/privacy.types";

export function parsePrivacyFormData(formData: FormData): PrivacyInput {
  return {
    privacy_accepted: formData.get("privacy_accepted") === "on",
    privacy_version: typeof formData.get("privacy_version") === "string" ? String(formData.get("privacy_version")) : "",
    marketing_accepted: formData.get("marketing_accepted") === "on",
  };
}
