"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { ACTIVITY_IMAGE_BUCKET } from "@/features/activities/constants/activity.constants";
import { activityFormSchema } from "@/features/activities/schemas/activity.schema";
import type { ActivityFormState } from "@/features/activities/types/activity-form.types";
import type { ActivityStatus, ActivityType } from "@/features/activities/types/activity.types";
import { toDatabaseTimestamp } from "@/features/activities/utils/activity-formatters";
import { parseActivityFormData } from "@/features/activities/utils/form-data";
import { slugify } from "@/features/activities/utils/slugify";
import { requireAdmin } from "@/features/auth/services/admin-session";
import type { Json } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX_BANNER_SIZE = 5 * 1024 * 1024;
const BANNER_TYPES = ["image/jpeg", "image/png", "image/webp"];

function adminListRoute(type: ActivityType): string {
  return type === "event" ? ROUTES.adminEvents : ROUTES.adminTrainings;
}

function validateBanner(file: File): string | null {
  if (!file.size) return null;
  if (!BANNER_TYPES.includes(file.type)) return "Usa una imagen JPG, PNG o WebP.";
  if (file.size > MAX_BANNER_SIZE) return "El banner no debe superar 5 MB.";
  return null;
}

async function uploadBanner(file: File, activityId: string): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${activityId}/${crypto.randomUUID()}.${extension}`;
  const client = await createServerSupabaseClient();
  const { error } = await client.storage
    .from(ACTIVITY_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error("La actividad se guardó, pero el banner no pudo cargarse.");
  return path;
}

export async function saveActivityAction(
  _previousState: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  await requireAdmin();
  const input = parseActivityFormData(formData);
  const parsed = activityFormSchema.safeParse(input);
  const banner = formData.get("banner");

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  if (banner instanceof File) {
    const bannerError = validateBanner(banner);
    if (bannerError) return { errors: { banner: [bannerError] } };
  }

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

  if (error || !activityId) {
    return { message: "No fue posible guardar la actividad." };
  }

  if (banner instanceof File && banner.size) {
    try {
      const bannerPath = await uploadBanner(banner, activityId);
      const { error: updateError } = await client
        .from("activities")
        .update({ banner_path: bannerPath })
        .eq("id", activityId);
      if (updateError) throw updateError;
    } catch (uploadError) {
      return {
        message:
          uploadError instanceof Error
            ? uploadError.message
            : "La actividad se guardó sin banner.",
        success: true,
      };
    }
  }

  revalidatePath(ROUTES.events);
  revalidatePath(ROUTES.trainings);
  revalidatePath(adminListRoute(parsed.data.type));
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
  if (error) throw new Error("No fue posible cambiar el estado.", { cause: error });

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
