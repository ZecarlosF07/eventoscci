import { z } from "zod";

export async function fetchAdminDetail<T>(url: string, signal: AbortSignal, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(url, { cache: "no-store", credentials: "same-origin", signal });
  const body: unknown = await response.json();
  if (!response.ok) {
    const error = z.object({ error: z.string() }).safeParse(body);
    throw new Error(error.success ? error.data.error : "No se pudo cargar el detalle. Intenta nuevamente.");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new Error("La respuesta del detalle no es válida. Intenta nuevamente.");
  return parsed.data;
}
