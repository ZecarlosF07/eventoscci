import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";

import { CERTIFICATE_BUCKET, MAX_CERTIFICATE_ASSET_SIZE } from "@/features/certificates/constants/certificate.constants";
import type { Database } from "@/lib/supabase/database.types";

export async function readTemplateAsset(client: SupabaseClient<Database>, path: string, staged = false, signature = false) {
  if (staged && !/^staging\/[a-f0-9-]{36}\.(png|jpg|webp)$/.test(path)) {
    throw new Error("Selecciona nuevamente la imagen.");
  }
  const { data, error } = await client.storage.from(CERTIFICATE_BUCKET).download(path);
  if (error) throw new Error("No se pudo leer la imagen. Vuelve a seleccionarla.", { cause: error });
  const bytes = new Uint8Array(await data.arrayBuffer());
  if (!staged) return bytes;
  if (bytes.length > MAX_CERTIFICATE_ASSET_SIZE) throw new Error("La imagen supera el límite de 5 MB.");
  try {
    const image = sharp(bytes, { limitInputPixels: 24_000_000 });
    const metadata = await image.metadata();
    if (!["png", "jpeg", "webp"].includes(metadata.format) || (metadata.pages ?? 1) > 1) {
      throw new Error("Formato de imagen no admitido");
    }
    const rotated = image.rotate().resize(signature ? 680 : 1500, signature ? 250 : 2120, { fit: "inside", withoutEnlargement: true });
    const normalized = metadata.format === "jpeg" || (!metadata.hasAlpha && (!signature || metadata.format === "webp"))
      ? await rotated.jpeg({ quality: 92 }).toBuffer()
      : await rotated.png().toBuffer();
    if (normalized.length > MAX_CERTIFICATE_ASSET_SIZE) {
      const resized = await rotated.resize(1050, 1485, { fit: "inside", withoutEnlargement: true }).png({ palette: true }).toBuffer();
      return new Uint8Array(resized);
    }
    return new Uint8Array(normalized);
  } catch (cause) {
    throw new Error("Usa una imagen PNG, JPG o WebP estática y legible. Si es muy grande, reduce sus dimensiones.", { cause });
  }
}

export async function storeTemplateAsset(
  client: SupabaseClient<Database>, templateId: string, kind: "background" | "signature", bytes: Uint8Array,
) {
  const png = bytes[0] === 0x89;
  const path = `templates/${templateId}/${kind}/${crypto.randomUUID()}.${png ? "png" : "jpg"}`;
  const { error } = await client.storage.from(CERTIFICATE_BUCKET).upload(path, bytes, {
    contentType: png ? "image/png" : "image/jpeg",
    upsert: false,
  });
  if (error) throw new Error("No se pudo guardar la imagen. Revisa tu conexión e inténtalo nuevamente.", { cause: error });
  return path;
}
