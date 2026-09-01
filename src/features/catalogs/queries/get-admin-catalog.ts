import "server-only";

import type {
  CatalogAdminItem,
  CatalogKind,
  CatalogRecord,
  SpeakerAdminRecord,
} from "@/features/catalogs/types/catalog.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAdminCatalogItems(kind: CatalogKind): Promise<CatalogAdminItem[]> {
  const client = await createServerSupabaseClient();

  if (kind === "venues") {
    const { data, error } = await client.from("venues").select("*, activities(id)").is("deleted_at", null).order("name");
    if (error) throw new Error("No fue posible consultar los lugares.", { cause: error });
    return data.map((item) => ({
      description: item.address,
      id: item.id,
      isActive: item.is_active,
      label: item.name,
      meta: item.reference,
      usageCount: item.activities.length,
    }));
  }

  if (kind === "contacts") {
    const { data, error } = await client.from("activity_contacts").select("*, activities(id)").is("deleted_at", null).order("label");
    if (error) throw new Error("No fue posible consultar los contactos.", { cause: error });
    return data.map((item) => ({
      description: `${item.contact_name} · ${item.whatsapp_phone}`,
      id: item.id,
      isActive: item.is_active,
      label: item.label,
      meta: item.is_default ? "Predeterminado" : item.email,
      usageCount: item.activities.length,
    }));
  }

  if (kind === "categories") {
    const { data, error } = await client.from("categories").select("*, activities(id)").is("deleted_at", null).order("sort_order").order("name");
    if (error) throw new Error("No fue posible consultar las categorías.", { cause: error });
    return data.map((item) => ({
      description: item.description,
      id: item.id,
      isActive: item.is_active,
      label: item.name,
      meta: item.slug,
      usageCount: item.activities.length,
    }));
  }

  const { data, error } = await client.from("speakers")
    .select("*, activity_speakers(id), course_instructors(id)")
    .is("deleted_at", null).order("last_names").order("first_names");
  if (error) throw new Error("No fue posible consultar los ponentes.", { cause: error });
  return data.map((item) => ({
    description: [item.professional_title, item.organization].filter(Boolean).join(" · "),
    id: item.id,
    isActive: item.is_active,
    label: `${item.first_names} ${item.last_names}`,
    meta: item.specialties.join(", "),
    usageCount: item.activity_speakers.length + item.course_instructors.length,
  }));
}

export async function getAdminCatalogRecord(kind: CatalogKind, id: string): Promise<CatalogRecord | null> {
  const client = await createServerSupabaseClient();

  if (kind === "speakers") {
    const { data, error } = await client.from("speakers")
      .select("*, private_details:speaker_private_details(*)")
      .eq("id", id).is("deleted_at", null).maybeSingle();
    if (error) throw new Error("No fue posible consultar el ponente.", { cause: error });
    if (!data) return null;
    return {
      ...data,
      private_details: Array.isArray(data.private_details) ? data.private_details[0] ?? null : data.private_details,
    } as SpeakerAdminRecord;
  }

  const table = kind === "venues" ? "venues" : kind === "contacts" ? "activity_contacts" : "categories";
  const { data, error } = await client.from(table).select("*").eq("id", id).is("deleted_at", null).maybeSingle();
  if (error) throw new Error("No fue posible consultar el catálogo.", { cause: error });
  return data as CatalogRecord | null;
}
