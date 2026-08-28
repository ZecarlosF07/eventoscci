const PERU_MOBILE_PATTERN = /^9\d{8}$/;
const INTERNATIONAL_PHONE_PATTERN = /^[1-9]\d{10,14}$/;

export function normalizeWhatsAppPhone(value: string | null): string | null {
  const digits = value?.replace(/\D/g, "") ?? "";
  if (PERU_MOBILE_PATTERN.test(digits)) return `51${digits}`;
  return INTERNATIONAL_PHONE_PATTERN.test(digits) ? digits : null;
}

export function getWhatsAppUrl(phone: string | null, activityTitle: string): string | null {
  const normalizedPhone = normalizeWhatsAppPhone(phone);
  if (!normalizedPhone) return null;
  const message = `Hola, quisiera más información sobre “${activityTitle}”.`;
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
