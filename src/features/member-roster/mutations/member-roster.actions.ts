"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/features/auth/services/admin-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function applyMemberRosterImportAction(importId: string): Promise<{ message: string; success: boolean }> {
  const account = await requireAdmin();
  if (account.role !== "administrator") return { message: "Solo un administrador puede reemplazar el padrón.", success: false };
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("apply_member_roster_import", { p_import_id: importId });
  if (error) {
    return {
      message: error.message.includes("ROSTER_PREVIEW_STALE")
        ? "El padrón cambió desde la vista previa. Sube el archivo nuevamente antes de confirmar."
        : "No se pudo reemplazar el padrón. El anterior permanece intacto.",
      success: false,
    };
  }
  revalidatePath("/admin/asociados");
  return { message: "Padrón reemplazado correctamente.", success: true };
}
