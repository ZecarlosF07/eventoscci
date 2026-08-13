export const CERTIFICATE_BUCKET = "certificates";
export const CERTIFICATE_PAGE_SIZE = 20;
export const CERTIFICATE_BACKGROUND_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const CERTIFICATE_SIGNATURE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_CERTIFICATE_ASSET_SIZE = 5 * 1024 * 1024;

export const CERTIFICATE_STATUS_LABELS = {
  issued: "Emitido",
  revoked: "Revocado",
} as const;
