import { getAdminSession } from "@/features/auth/services/admin-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createXlsxResponse } from "@/utils/xlsx-export";

const EXPORT_PAGE_SIZE = 1000;

export async function GET(): Promise<Response> {
  if (!await getAdminSession()) return new Response("No autorizado", { status: 401, headers: { "Cache-Control": "private, no-store" } });
  const client = await createServerSupabaseClient();
  const rows: string[][] = [];
  for (let offset = 0; ; offset += EXPORT_PAGE_SIZE) {
    const { data, error } = await client.from("authorized_marketing_contacts")
      .select("person_id,first_names,last_names,email,phone,authorized_at,policy_version").order("person_id").range(offset, offset + EXPORT_PAGE_SIZE - 1);
    if (error) return new Response("No fue posible consultar los contactos autorizados.", { status: 500, headers: { "Cache-Control": "private, no-store" } });
    rows.push(...data.map((person) => [person.first_names ?? "", person.last_names ?? "", person.email ?? "", person.phone ?? "", person.authorized_at ?? "", person.policy_version ?? ""]));
    if (data.length < EXPORT_PAGE_SIZE) break;
  }
  return createXlsxResponse({ headers: ["Nombres", "Apellidos", "Correo", "WhatsApp", "Autorización registrada", "Versión de privacidad"], rows }, "contactos-publicidad-autorizados", "Contactos autorizados");
}
