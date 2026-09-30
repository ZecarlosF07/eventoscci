import "server-only";

import { CERTIFICATE_HOURS_REGENERATION_BATCH_SIZE } from "@/features/certificates/constants/certificate.constants";
import { countOutdatedActivityCertificateHours, getOutdatedActivityCertificateHoursQuery } from "@/features/certificates/queries/get-outdated-activity-certificate-hours";
import { getCertificateTemplatesWithClient } from "@/features/certificates/queries/get-certificate-templates";
import { certificateGenerationSchema } from "@/features/certificates/schemas/certificate-query.schema";
import { loadCertificateDocumentAssets } from "@/features/certificates/services/certificate-assets";
import { removeCertificateFile } from "@/features/certificates/services/remove-certificate-file";
import { storeCertificatePdf } from "@/features/certificates/services/store-certificate-pdf";
import type { CertificateHoursRegenerationState } from "@/features/certificates/types/certificate-hours.types";
import { getSiteUrl } from "@/lib/env/server-env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logSupabaseError } from "@/lib/supabase/supabase-error";

export async function regenerateActivityCertificateHours(activityId: string, expectedHours: number): Promise<CertificateHoursRegenerationState> {
  const client = await createServerSupabaseClient();
  const activity = await client.from("activities").select("academic_hours")
    .eq("id", activityId).neq("status", "archived").is("deleted_at", null).maybeSingle();
  if (activity.error || activity.data?.academic_hours !== expectedHours) {
    return { message: "Las horas de la actividad cambiaron o no están disponibles. Actualiza la página.", success: false };
  }
  const result = await getOutdatedActivityCertificateHoursQuery(client, activityId, expectedHours)
    .order("id").limit(CERTIFICATE_HOURS_REGENERATION_BATCH_SIZE);
  if (result.error) return { message: "No fue posible consultar los certificados por corregir.", success: false };
  const templates = await getCertificateTemplatesWithClient(client);
  const assets = new Map<string, Awaited<ReturnType<typeof loadCertificateDocumentAssets>>>();
  const failedCertificateCodes: string[] = [];
  let regeneratedCount = 0;
  let cleanupWarningCount = 0;
  for (const row of result.data ?? []) {
    let uploadedPath: string | undefined;
    try {
      const parsed = certificateGenerationSchema.parse(row);
      const template = templates.find((item) => item.id === row.template_id);
      if (!template || !parsed.file_path?.startsWith(`issued/${parsed.id}/`)) throw new Error("CERTIFICATE_NOT_AVAILABLE");
      const corrected = { ...parsed, template, academic_hours_snapshot: expectedHours };
      const documentAssets = assets.get(template.id) ?? await loadCertificateDocumentAssets(client, corrected);
      assets.set(template.id, documentAssets);
      const newPath = `issued/${parsed.id}/${parsed.certificate_code}-${crypto.randomUUID()}.pdf`;
      await storeCertificatePdf(client, corrected, getSiteUrl(), newPath, documentAssets);
      uploadedPath = newPath;
      const replaced = await client.rpc("replace_activity_certificate_hours", {
        p_activity_id: activityId, p_certificate_id: parsed.id,
        p_new_hours: expectedHours, p_expected_file_path: parsed.file_path, p_new_file_path: newPath,
      });
      if (replaced.error) {
        const current = await client.from("certificates").select("file_path").eq("id", parsed.id).maybeSingle();
        if (current.error) uploadedPath = undefined;
        if (current.data?.file_path !== newPath) throw new Error("CERTIFICATE_REPLACEMENT_FAILED", { cause: replaced.error });
      }
      uploadedPath = undefined;
      regeneratedCount += 1;
      if (!await removeCertificateFile(client, parsed.file_path)) cleanupWarningCount += 1;
    } catch (error) {
      if (uploadedPath) await removeCertificateFile(client, uploadedPath);
      failedCertificateCodes.push(row.certificate_code);
      logSupabaseError("certificate_hours_regeneration_failed", error instanceof Error ? error : { message: "Unknown regeneration error" }, { certificateId: row.id, activityId });
    }
  }
  const errorCount = failedCertificateCodes.length;
  let remainingCount: number;
  try {
    remainingCount = await countOutdatedActivityCertificateHours(client, activityId, expectedHours);
  } catch (error) {
    logSupabaseError("certificate_hours_remaining_count_failed", error instanceof Error ? error : { message: "Unknown count error" }, { activityId });
    return { cleanupWarningCount, errorCount, failedCertificateCodes, regeneratedCount, totalCount: result.count ?? 0, success: false,
      message: "Los cambios confirmados quedaron guardados, pero no se pudo consultar el total pendiente." };
  }
  return {
    cleanupWarningCount, errorCount, failedCertificateCodes, regeneratedCount, remainingCount, totalCount: result.count ?? 0,
    hasMore: !errorCount && remainingCount > 0,
    message: errorCount ? `No pudieron corregirse: ${failedCertificateCodes.join(", ")}. Puedes reintentar los pendientes.` : "Certificados actualizados.",
    success: errorCount === 0, warning: cleanupWarningCount > 0,
  };
}
