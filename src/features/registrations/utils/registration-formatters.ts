const REGISTRATION_DATE_FORMATTER = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Lima",
});

const REGISTRATION_PRICE_FORMATTER = new Intl.NumberFormat("es-PE", {
  currency: "PEN",
  style: "currency",
});

export function formatRegistrationDate(value: string): string {
  return REGISTRATION_DATE_FORMATTER.format(new Date(value));
}

export function formatRegistrationPrice(value: number): string {
  return value === 0 ? "Gratis" : REGISTRATION_PRICE_FORMATTER.format(value);
}
