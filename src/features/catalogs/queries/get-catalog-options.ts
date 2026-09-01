import "server-only";

import type {
  ActivityContactSummary,
  VenueSummary,
} from "@/features/catalogs/types/catalog.types";
import { getActiveCategories } from "@/features/categories/queries/get-active-categories";
import { getActiveSpeakers } from "@/features/speakers/queries/get-active-speakers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCatalogOptions() {
  const client = await createServerSupabaseClient();
  const [categories, speakers, venueResult, contactResult] = await Promise.all([
    getActiveCategories(client),
    getActiveSpeakers(client),
    client.from("venues").select("id, name, address, reference, maps_embed_url, is_active")
      .eq("is_active", true).is("deleted_at", null).order("name"),
    client.from("activity_contacts")
      .select("id, label, contact_name, whatsapp_phone, email, is_default, is_active")
      .eq("is_active", true).is("deleted_at", null)
      .order("is_default", { ascending: false }).order("label"),
  ]);

  if (venueResult.error) throw new Error("No fue posible consultar los lugares.", { cause: venueResult.error });
  if (contactResult.error) throw new Error("No fue posible consultar los contactos.", { cause: contactResult.error });

  return {
    categories,
    contacts: contactResult.data as ActivityContactSummary[],
    speakers,
    venues: venueResult.data as VenueSummary[],
  };
}
