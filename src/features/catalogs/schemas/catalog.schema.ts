import { z } from "zod";

import { normalizeWhatsAppPhone } from "@/features/activities/utils/activity-contact";
import { isGoogleMapsEmbedUrl } from "@/features/activities/utils/activity-maps";

const optionalHttpsUrl = z.union([
  z.url("Ingresa una URL válida.").refine((value) => value.startsWith("https://"), "La URL debe usar HTTPS."),
  z.literal(""),
]);

export const venueSchema = z.object({
  address: z.string().trim().min(5, "Ingresa la dirección completa."),
  id: z.union([z.uuid(), z.literal("")]),
  is_active: z.boolean(),
  maps_embed_url: z.string().trim().refine(isGoogleMapsEmbedUrl, "Ingresa una URL de inserción válida de Google Maps."),
  name: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres."),
  reference: z.string().trim().max(240, "La referencia no puede superar 240 caracteres."),
});

export const contactSchema = z.object({
  contact_name: z.string().trim().min(3, "Ingresa el nombre del responsable."),
  email: z.union([z.email("Ingresa un correo válido."), z.literal("")]),
  id: z.union([z.uuid(), z.literal("")]),
  is_active: z.boolean(),
  is_default: z.boolean(),
  label: z.string().trim().min(3, "Ingresa un nombre para identificar el contacto."),
  whatsapp_phone: z.string().trim().refine((value) => Boolean(normalizeWhatsAppPhone(value)), "Ingresa un WhatsApp válido."),
});

export const categorySchema = z.object({
  description: z.string().trim().max(500, "La descripción no puede superar 500 caracteres."),
  id: z.union([z.uuid(), z.literal("")]),
  is_active: z.boolean(),
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
  slug: z.string().trim(),
  sort_order: z.coerce.number().int().nonnegative("El orden debe ser cero o mayor."),
});

export const speakerSchema = z.object({
  bio: z.string().trim().max(2000, "La biografía no puede superar 2000 caracteres."),
  email: z.union([z.email("Ingresa un correo válido."), z.literal("")]),
  first_names: z.string().trim().min(2, "Ingresa los nombres."),
  id: z.union([z.uuid(), z.literal("")]),
  is_active: z.boolean(),
  last_names: z.string().trim().min(2, "Ingresa los apellidos."),
  linkedin_url: optionalHttpsUrl,
  notes: z.string().trim().max(2000, "Las notas no pueden superar 2000 caracteres."),
  organization: z.string().trim().max(200, "La organización no puede superar 200 caracteres."),
  phone: z.string().trim().max(30, "El teléfono no puede superar 30 caracteres."),
  professional_title: z.string().trim().max(200, "El cargo no puede superar 200 caracteres."),
  specialties: z.array(z.string().trim().min(2)).max(12, "Agrega como máximo 12 especialidades."),
  website_url: optionalHttpsUrl,
});
