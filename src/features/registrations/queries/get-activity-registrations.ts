import "server-only";

import { REGISTRATION_PAGE_SIZE } from "@/features/registrations/constants/registration.constants";
import { registrationAdminItemSchema } from "@/features/registrations/schemas/registration.schema";
import type {
  RegistrationActivityOption,
  RegistrationAdminFilters,
  RegistrationAdminItem,
  RegistrationAdminPage,
} from "@/features/registrations/types/registration.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { escapePostgrestSearch } from "@/utils/postgrest-search";

const REGISTRATION_ADMIN_SELECT = `
  id,
  registration_code,
  registration_type,
  status,
  confirmed_at,
  confirmed_by,
  cancelled_at,
  cancellation_reason,
  company_snapshot,
  ruc_snapshot,
  price_snapshot,
  created_at,
  activity:activities!inner(id, title, slug, type),
  attendance:attendance!inner(id, status),
  person:people!inner(
    id,
    document_type,
    document_number,
    first_names,
    last_names,
    email,
    phone,
    job_title
  )
`;

function parseAdminItems(data: unknown[]): RegistrationAdminItem[] {
  return data.map((item) => {
    const parsed = registrationAdminItemSchema.safeParse(item);
    if (!parsed.success) {
      throw new Error("La respuesta de inscripciones no tiene el formato esperado.");
    }
    return parsed.data;
  });
}

export async function getActivityRegistrations(
  filters: RegistrationAdminFilters,
): Promise<RegistrationAdminPage> {
  const client = await createServerSupabaseClient();
  const from = (filters.page - 1) * REGISTRATION_PAGE_SIZE;
  const to = from + REGISTRATION_PAGE_SIZE - 1;
  let query = client
    .from("registrations")
    .select(REGISTRATION_ADMIN_SELECT, { count: "exact" })
    .is("deleted_at", null)
    .is("attendance.deleted_at", null)
    .is("person.deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.activityId) query = query.eq("activity_id", filters.activityId);
  if (filters.activityType) query = query.eq("activity.type", filters.activityType);
  if (filters.registrationType) query = query.eq("registration_type", filters.registrationType);
  if (filters.attendanceStatus) query = query.eq("attendance.status", filters.attendanceStatus);
  const search = filters.query ? escapePostgrestSearch(filters.query) : "";
  if (search) {
    const pattern = `%${search}%`;
    query = query.or([
      `document_number.ilike.${pattern}`,
      `first_names.ilike.${pattern}`,
      `last_names.ilike.${pattern}`,
      `email.ilike.${pattern}`,
      `phone.ilike.${pattern}`,
    ].join(","), { referencedTable: "person" });
  }

  const { count, data, error } = await query.range(from, to);
  if (error) {
    throw new Error("No fue posible consultar las inscripciones.", { cause: error });
  }

  const total = count ?? 0;
  return {
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / REGISTRATION_PAGE_SIZE)),
    registrations: parseAdminItems(data ?? []),
    total,
  };
}

export async function getRegistrationActivityOptions(): Promise<RegistrationActivityOption[]> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from("activities")
    .select("id, title, type")
    .is("deleted_at", null)
    .order("title")
    .limit(500);
  if (error) throw new Error("No fue posible consultar las actividades.", { cause: error });
  return data ?? [];
}

export async function getRegistrationsForExport(
  filters: Omit<RegistrationAdminFilters, "page">,
): Promise<RegistrationAdminItem[]> {
  const client = await createServerSupabaseClient();
  let query = client
    .from("registrations")
    .select(REGISTRATION_ADMIN_SELECT)
    .is("deleted_at", null)
    .is("attendance.deleted_at", null)
    .is("person.deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.activityId) query = query.eq("activity_id", filters.activityId);
  if (filters.activityType) query = query.eq("activity.type", filters.activityType);
  if (filters.registrationType) query = query.eq("registration_type", filters.registrationType);
  if (filters.attendanceStatus) query = query.eq("attendance.status", filters.attendanceStatus);
  const search = filters.query ? escapePostgrestSearch(filters.query) : "";
  if (search) {
    const pattern = `%${search}%`;
    query = query.or([
      `document_number.ilike.${pattern}`,
      `first_names.ilike.${pattern}`,
      `last_names.ilike.${pattern}`,
      `email.ilike.${pattern}`,
      `phone.ilike.${pattern}`,
    ].join(","), { referencedTable: "person" });
  }
  const { data, error } = await query;
  if (error) throw new Error("No fue posible preparar la exportación.", { cause: error });
  return parseAdminItems(data ?? []);
}

export function getPendingRegistrations(
  filters: Omit<RegistrationAdminFilters, "status">,
): Promise<RegistrationAdminPage> {
  return getActivityRegistrations({ ...filters, status: "pending" });
}

export function getConfirmedRegistrations(
  filters: Omit<RegistrationAdminFilters, "status">,
): Promise<RegistrationAdminPage> {
  return getActivityRegistrations({ ...filters, status: "confirmed" });
}

export async function getRegistrationByCode(
  registrationCode: string,
): Promise<RegistrationAdminItem | null> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from("registrations")
    .select(REGISTRATION_ADMIN_SELECT)
    .eq("registration_code", registrationCode.toUpperCase().trim())
    .is("deleted_at", null)
    .is("attendance.deleted_at", null)
    .is("person.deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error("No fue posible consultar la inscripción.", { cause: error });
  }
  if (!data) return null;

  const parsed = registrationAdminItemSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("La respuesta de inscripción no tiene el formato esperado.");
  }
  return parsed.data;
}
