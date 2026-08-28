"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { activityFormSchema } from "@/features/activities/schemas/activity.schema";
import {
  getActivityMediaInput,
  syncActivityMedia,
  validateActivityMedia,
} from "@/features/activities/services/activity-media.service";
import type { ActivityFormState } from "@/features/activities/types/activity-form.types";
import type { ActivityStatus, ActivityType } from "@/features/activities/types/activity.types";
import { toDatabaseTimestamp } from "@/features/activities/utils/activity-formatters";
import { parseActivityFormData } from "@/features/activities/utils/form-data";
import { slugify } from "@/features/activities/utils/slugify";
import { requireAdmin } from "@/features/auth/services/admin-session";
import type { Json } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseErrorMessage, logSupabaseError, matchesSupabaseError } from "@/lib/supabase/supabase-error";

function adminListRoute(type: ActivityType): string {
  return type === "event" ? ROUTES.adminEvents : ROUTES.adminTrainings;
}

function revalidateActivityPages(type: ActivityType): void {
  revalidatePath(ROUTES.events);
  revalidatePath(ROUTES.trainings);
  revalidatePath(adminListRoute(type));
}

export async function saveActivityAction(
  previousState: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  await requireAdmin();
  const input = parseActivityFormData(formData);
  const savedId = input.id || previousState.savedId;
  const parsed = activityFormSchema.safeParse(input);
  const mediaInput = getActivityMediaInput(formData);
  const mediaErrors = validateActivityMedia(mediaInput);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, savedId };
  }
  if (Object.keys(mediaErrors).length) return { errors: mediaErrors, savedId };

  const { dates, speakers, ...activityInput } = parsed.data;
  const activity = {
    ...activityInput,
    general_price: activityInput.is_free ? "0" : activityInput.general_price || "0",
    member_price: activityInput.is_free ? "0" : activityInput.member_price || "0",
    registration_close_at: toDatabaseTimestamp(activityInput.registration_close_at),
    registration_open_at: toDatabaseTimestamp(activityInput.registration_open_at),
    slug: slugify(activityInput.slug || activityInput.title),
  };
  const normalizedDates = dates.map((date) => ({
    ...date,
    ends_at: toDatabaseTimestamp(date.ends_at),
    starts_at: toDatabaseTimestamp(date.starts_at),
  }));
  const client = await createServerSupabaseClient();
  const { data: activityId, error } = await client.rpc("save_activity", {
    p_activity: activity as Json,
    p_dates: normalizedDates as Json,
    p_speakers: speakers as Json,
  });

  if (error) {
    logSupabaseError("activity_save_failed", error, { activityType: parsed.data.type });
    if (error.code === "23505" && matchesSupabaseError(error, "slug")) {
      return { errors: { slug: ["Este slug ya pertenece a otra actividad. Modifícalo o déjalo vacío para generarlo nuevamente."] }, savedId };
    }
    return {
      message: getSupabaseErrorMessage(error, {
        fallback: "No se pudo guardar la actividad. Actualiza la página e inténtalo nuevamente.",
        messages: {
          "activities_maps_embed_url_valid": "La URL del mapa no corresponde a una inserción válida de Google Maps.",
          "activities_published_map_required": "Agrega el mapa antes de publicar una actividad presencial o híbrida.",
          "activities_published_whatsapp_required": "Ingresa un número de WhatsApp válido antes de publicar.",
          "La actividad requiere al menos una fecha": "Agrega al menos una fecha y horario para guardar la actividad.",
        },
      }),
      savedId,
    };
  }
  if (!activityId) {
    return { message: "La actividad no pudo confirmarse después de guardarla. Actualiza la lista antes de volver a intentarlo.", savedId };
  }

  try {
    await syncActivityMedia(mediaInput, activityId);
  } catch (uploadError) {
    revalidateActivityPages(parsed.data.type);
    return {
      message: uploadError instanceof Error ? uploadError.message : "La actividad se guardó sin completar sus imágenes.",
      savedId: activityId,
      success: true,
      warning: true,
    };
  }

  revalidateActivityPages(parsed.data.type);
  redirect(`${adminListRoute(parsed.data.type)}/${activityId}/editar?guardado=1`);
}

export async function changeActivityStatusAction(
  activityId: string,
  type: ActivityType,
  status: ActivityStatus,
): Promise<void> {
  await requireAdmin();
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("set_activity_status", {
    p_activity_id: activityId,
    p_status: status,
  });
  if (error) {
    throw new Error(getSupabaseErrorMessage(error, {
      fallback: "No fue posible cambiar el estado.",
      messages: {
        "activities_published_map_required": "Agrega el mapa antes de publicar una actividad presencial o híbrida.",
        "activities_published_whatsapp_required": "Ingresa un número de WhatsApp válido antes de publicar.",
      },
    }), { cause: error });
  }

  revalidatePath(adminListRoute(type));
  revalidatePath(ROUTES.events);
  revalidatePath(ROUTES.trainings);
}

export async function deleteActivityAction(
  activityId: string,
  type: ActivityType,
): Promise<void> {
  await requireAdmin();
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("soft_delete_activity", {
    p_activity_id: activityId,
  });
  if (error) throw new Error("No fue posible eliminar la actividad.", { cause: error });

  revalidatePath(ROUTES.events);
  revalidatePath(ROUTES.trainings);
  redirect(adminListRoute(type));
}
