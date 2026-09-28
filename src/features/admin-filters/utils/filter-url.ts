export const ADMIN_SEARCH_DELAY_MS = 350;

export function buildFilterUrl(pathname: string, current: string, values: Record<string, string>, pages = ["pagina"]): string {
  const params = new URLSearchParams(current);
  for (const [key, value] of Object.entries(values)) {
    if (value.trim()) params.set(key, value.trim());
    else params.delete(key);
  }
  for (const page of pages) params.delete(page);
  if (!("resultado" in values)) params.delete("resultado");
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function isCompleteFilterDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function filterDateError(values: Record<string, string>): string {
  if (values.desde && !isCompleteFilterDate(values.desde)) return "Completa una fecha válida en Desde.";
  if (values.hasta && !isCompleteFilterDate(values.hasta)) return "Completa una fecha válida en Hasta.";
  if (values.desde && values.hasta && values.desde > values.hasta) return "La fecha Desde no puede ser posterior a Hasta.";
  return "";
}

export function formFilterValues(form: HTMLFormElement): Record<string, string> {
  const values: Record<string, string> = {};
  for (const control of form.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input[name], select[name]")) {
    values[control.name] = control instanceof HTMLInputElement && control.type === "checkbox"
      ? control.checked ? control.value : "" : control.value;
  }
  return values;
}
