"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { CATALOG_ROUTE_SEGMENTS } from "@/features/catalogs/constants/catalog.constants";
import { ROUTES } from "@/constants/routes";
import { getSpeakerProfileScopeError } from "@/features/certificates/services/get-speaker-profile-scope";
import {
  categorySchema,
  contactSchema,
  speakerSchema,
  venueSchema,
} from "@/features/catalogs/schemas/catalog.schema";
import type {
  CatalogKind,
  CatalogOption,
  QuickCatalogResult,
} from "@/features/catalogs/types/catalog.types";
import { slugify } from "@/features/activities/utils/slugify";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { consumeStagedImage } from "@/features/media/services/consume-staged-image";
import { SPEAKER_IMAGE_BUCKET } from "@/features/speakers/constants/speaker.constants";
import { getSpeakerImageUrl } from "@/features/speakers/utils/speaker-image";
import { speakerDocumentError } from "@/features/speakers/services/speaker-document-error";
import { invalidatePublicCatalogContent } from "@/features/seo/services/invalidate-public-content";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/supabase-error";
import type { SupabaseErrorLike } from "@/lib/supabase/types/supabase-error.types";

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function errorLike(error: unknown): SupabaseErrorLike {
  if (error instanceof Error) return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return { ...error, message: error.message };
  return { message: String(error) };
}

function commonInput(formData: FormData) {
  return {
    id: text(formData, "id"),
    is_active: formData.get("is_active") === "on" || formData.get("quick") === "1",
  };
}

function catalogPath(kind: CatalogKind): string {
  return `/admin/catalogos/${CATALOG_ROUTE_SEGMENTS[kind]}`;
}

function catalogErrorMessage(error: SupabaseErrorLike): string {
  return getSupabaseErrorMessage(error, {
    fallback: "No fue posible guardar el registro.",
    messages: {
      activity_contacts_whatsapp_valid: "Ingresa un número de WhatsApp peruano o internacional válido.",
      speakers_specialties_limit: "Agrega como máximo 12 especialidades.",
      uq_activity_contacts_default_active: "Ya existe otro contacto predeterminado. Actualiza la página e inténtalo nuevamente.",
      uq_activity_contacts_label_active: "Ya existe un contacto con ese nombre identificador.",
      uq_venues_name_address_active: "Ya existe un lugar con el mismo nombre y dirección.",
      venues_maps_embed_url_valid: "La URL debe ser el enlace de inserción HTTPS de Google Maps.",
    },
  });
}

async function saveVenue(formData: FormData): Promise<CatalogOption> {
  const parsed = venueSchema.safeParse({
    ...commonInput(formData),
    address: text(formData, "address"),
    maps_embed_url: text(formData, "maps_embed_url"),
    name: text(formData, "name"),
    reference: text(formData, "reference"),
  });
  if (!parsed.success) throw parsed.error;
  const client = await createServerSupabaseClient();
  const payload = { ...parsed.data, id: parsed.data.id || undefined, reference: parsed.data.reference || null };
  const { data, error } = await client.from("venues").upsert(payload).select("id, name, address").single();
  if (error) throw error;
  return { description: data.address, id: data.id, label: data.name };
}

async function saveContact(formData: FormData): Promise<CatalogOption> {
  const parsed = contactSchema.safeParse({
    ...commonInput(formData),
    contact_name: text(formData, "contact_name"),
    email: text(formData, "email"),
    is_default: formData.get("is_default") === "on",
    label: text(formData, "label"),
    whatsapp_phone: text(formData, "whatsapp_phone"),
  });
  if (!parsed.success) throw parsed.error;
  const client = await createServerSupabaseClient();
  if (parsed.data.is_default) {
    const { error } = await client.from("activity_contacts").update({ is_default: false }).eq("is_default", true);
    if (error) throw error;
  }
  const payload = { ...parsed.data, email: parsed.data.email || null, id: parsed.data.id || undefined };
  const { data, error } = await client.from("activity_contacts").upsert(payload)
    .select("id, label, contact_name, whatsapp_phone").single();
  if (error) throw error;
  return { description: `${data.contact_name} · ${data.whatsapp_phone}`, id: data.id, label: data.label };
}

async function saveCategory(formData: FormData): Promise<CatalogOption> {
  const parsed = categorySchema.safeParse({
    ...commonInput(formData),
    description: text(formData, "description"),
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    sort_order: text(formData, "sort_order") || "0",
  });
  if (!parsed.success) throw parsed.error;
  const client = await createServerSupabaseClient();
  const payload = {
    ...parsed.data,
    description: parsed.data.description || null,
    id: parsed.data.id || undefined,
    slug: slugify(parsed.data.slug || parsed.data.name),
  };
  const { data, error } = await client.from("categories").upsert(payload).select("id, name, description").single();
  if (error) throw error;
  return { description: data.description ?? undefined, id: data.id, label: data.name };
}

async function saveSpeaker(formData: FormData): Promise<CatalogOption> {
  const parsed = speakerSchema.safeParse({
    ...commonInput(formData),
    document_number: text(formData, "document_number"),
    bio: text(formData, "bio"),
    email: text(formData, "email"),
    first_names: text(formData, "first_names"),
    last_names: text(formData, "last_names"),
    linkedin_url: text(formData, "linkedin_url"),
    notes: text(formData, "notes"),
    organization: text(formData, "organization"),
    phone: text(formData, "phone"),
    professional_title: text(formData, "professional_title"),
    specialties: text(formData, "specialties").split(",").map((item) => item.trim()).filter(Boolean),
    website_url: text(formData, "website_url"),
  });
  if (!parsed.success) throw parsed.error;

  const stagedPhotoPath = text(formData, "photo_staged_path");
  const client = await createServerSupabaseClient();
  const speakerPayload = {
    bio: parsed.data.bio || null,
    first_names: parsed.data.first_names,
    id: parsed.data.id || undefined,
    is_active: parsed.data.is_active,
    last_names: parsed.data.last_names,
    linkedin_url: parsed.data.linkedin_url || null,
    organization: parsed.data.organization || null,
    professional_title: parsed.data.professional_title || null,
    specialties: parsed.data.specialties,
    website_url: parsed.data.website_url || null,
  };
  let speakerId = parsed.data.id;
  if (!speakerId) {
    const created = await client.rpc("create_speaker_with_document", {
      p_document_number: parsed.data.document_number, p_profile: speakerPayload,
    });
    if (created.error) throw created.error;
    speakerId = created.data;
  } else {
    const updated = await client.from("speakers").update(speakerPayload).eq("id", speakerId).is("deleted_at", null);
    if (updated.error) throw updated.error;
  }
  const { data, error } = await client.from("speakers").select("id, first_names, last_names, professional_title, organization, photo_path").eq("id", speakerId).single();
  if (error) throw error;

  let photoPath = data.photo_path;
  if (stagedPhotoPath) {
    photoPath = await consumeStagedImage(SPEAKER_IMAGE_BUCKET, stagedPhotoPath, data.id);
    const { error: photoError } = await client.from("speakers").update({ photo_path: photoPath }).eq("id", data.id);
    if (photoError) {
      await client.storage.from(SPEAKER_IMAGE_BUCKET).remove([photoPath]);
      throw photoError;
    }
    if (data.photo_path && data.photo_path !== photoPath) {
      const { error: cleanupError } = await client.storage.from(SPEAKER_IMAGE_BUCKET).remove([data.photo_path]);
      if (cleanupError) logSupabaseError("speaker_old_photo_cleanup_failed", cleanupError, { speakerId: data.id });
    }
  }

  const { error: privateError } = await client.from("speaker_private_details").upsert({
    email: parsed.data.email || null,
    notes: parsed.data.notes || null,
    phone: parsed.data.phone || null,
    speaker_id: data.id,
  });
  if (privateError) throw privateError;

  return {
    description: [data.professional_title, data.organization].filter(Boolean).join(" · "),
    id: data.id,
    imageUrl: getSpeakerImageUrl(photoPath),
    label: `${data.first_names} ${data.last_names}`,
  };
}

async function persistCatalog(kind: CatalogKind, formData: FormData): Promise<CatalogOption> {
  if (kind === "venues") return saveVenue(formData);
  if (kind === "contacts") return saveContact(formData);
  if (kind === "categories") return saveCategory(formData);
  return saveSpeaker(formData);
}

async function persistCatalogResult(kind: CatalogKind, formData: FormData): Promise<QuickCatalogResult> {
  try {
    const option = await persistCatalog(kind, formData);
    return { option, success: true };
  } catch (error) {
    if (error && typeof error === "object" && "flatten" in error) {
      const flattened = (error as { flatten: () => { fieldErrors: Record<string, string[]> } }).flatten();
      return { errors: flattened.fieldErrors };
    }
    logSupabaseError("catalog_save_failed", errorLike(error), { kind });
    if (errorLike(error).message?.includes("SPEAKER_DOCUMENT_")) return speakerDocumentError(errorLike(error));
    return { message: catalogErrorMessage(errorLike(error)) };
  }
}

export async function quickCreateCatalogAction(formData: FormData): Promise<QuickCatalogResult> {
  await requireAdmin();
  return persistCatalogResult(text(formData, "kind") as CatalogKind, formData);
}

export async function saveCatalogAction(_: QuickCatalogResult, formData: FormData): Promise<QuickCatalogResult> {
  await requireAdmin();
  const kind = text(formData, "kind") as CatalogKind;
  const result = await persistCatalogResult(kind, formData);
  if (!result.success) return result;
  revalidatePath(catalogPath(kind));
  invalidatePublicCatalogContent();
  redirect(catalogPath(kind));
}

export async function saveSpeakerProfileFromCertificatesAction(
  activityId: string, speakerId: string, _: QuickCatalogResult, formData: FormData,
): Promise<QuickCatalogResult> {
  await requireAdmin();
  const scopeError = await getSpeakerProfileScopeError(activityId, speakerId);
  if (scopeError) return { message: scopeError };
  if (text(formData, "id") !== speakerId) return { message: "El perfil seleccionado cambió. Actualiza la pantalla." };
  const result = await persistCatalogResult("speakers", formData);
  if (!result.success) return result;
  revalidatePath(catalogPath("speakers"));
  revalidatePath(`${catalogPath("speakers")}/${speakerId}`);
  revalidatePath(`${ROUTES.adminCertificatesSpeakers}/[activityId]`, "page");
  revalidatePath(ROUTES.adminCertificatesSpeakers);
  invalidatePublicCatalogContent();
  return { ...result, message: "Datos del perfil guardados en Catálogos. No se modificaron certificados preparados o emitidos." };
}

export async function setCatalogActiveAction(kind: CatalogKind, id: string, isActive: boolean): Promise<void> {
  await requireAdmin();
  const client = await createServerSupabaseClient();
  const table = kind === "venues" ? "venues" : kind === "contacts" ? "activity_contacts" : kind === "categories" ? "categories" : "speakers";
  const { error } = await client.from(table).update({ is_active: isActive }).eq("id", id).is("deleted_at", null);
  if (error) throw new Error("No fue posible cambiar el estado.", { cause: error });
  revalidatePath(catalogPath(kind));
  invalidatePublicCatalogContent();
}

export async function deleteUnusedCatalogAction(kind: CatalogKind, id: string): Promise<void> {
  await requireAdmin();
  const items = await (await import("@/features/catalogs/queries/get-admin-catalog")).getAdminCatalogItems(kind);
  const item = items.find((candidate) => candidate.id === id);
  if (!item || item.usageCount > 0) throw new Error("Solo se pueden eliminar registros que todavía no están en uso.");
  const client = await createServerSupabaseClient();
  const table = kind === "venues" ? "venues" : kind === "contacts" ? "activity_contacts" : kind === "categories" ? "categories" : "speakers";
  const { error } = await client.from(table).update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error("No fue posible eliminar el registro.", { cause: error });
  revalidatePath(catalogPath(kind));
  invalidatePublicCatalogContent();
}
