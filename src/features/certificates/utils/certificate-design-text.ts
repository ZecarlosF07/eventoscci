import type { Json } from "@/lib/supabase/database.types";

export const CERTIFICATE_HEADING_LIMIT = 180;
export const CERTIFICATE_RECOGNITION_LIMIT = 600;
export const CERTIFICATE_SIGNER_LIMIT = 4;

export function isCertificateRecognitionValid(text: string): boolean {
  return !text || (text.includes("{{condicion}}")
    && !/[{}]/.test(text.replaceAll("{{condicion}}", "").replaceAll("{{titulo}}", "")));
}

export function getCertificateDesignText(config: Json) {
  const source = config && typeof config === "object" && !Array.isArray(config) ? config : {};
  return {
    heading: typeof source.heading === "string" ? source.heading : "",
    recognition: typeof source.recognition === "string" ? source.recognition : "",
    layoutVersion: source.layout_version === 2 ? 2 : 1,
  };
}

export function resolveCertificateRecognition(text: string, condition: string, title: string): string {
  return text.replace(/\{\{(condicion|titulo)\}\}/g, (_, key) => key === "condicion" ? condition : title);
}
