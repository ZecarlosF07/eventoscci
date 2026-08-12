import { getActiveCategories } from "@/features/categories/queries/get-active-categories";
import type { FoundationStatus } from "@/features/foundation/types/foundation-status.types";
import { getActiveSpeakers } from "@/features/speakers/queries/get-active-speakers";
import { isSupabaseConfigured } from "@/lib/env/public-env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const UNCONFIGURED_STATUS: FoundationStatus = {
  categories: [],
  message: "Configura las variables de Supabase para validar la conexión real.",
  speakers: [],
  status: "unconfigured",
};

export async function getFoundationStatus(): Promise<FoundationStatus> {
  if (!isSupabaseConfigured()) {
    return UNCONFIGURED_STATUS;
  }

  try {
    const client = await createServerSupabaseClient();
    const [categories, speakers] = await Promise.all([
      getActiveCategories(client),
      getActiveSpeakers(client),
    ]);

    return {
      categories,
      message: "Next.js está consultando datos reales del núcleo en Supabase.",
      speakers,
      status: "connected",
    };
  } catch (error) {
    console.error("Falló la verificación del núcleo de Supabase.", error);

    return {
      categories: [],
      message: "La configuración existe, pero la consulta a Supabase falló.",
      speakers: [],
      status: "error",
    };
  }
}
