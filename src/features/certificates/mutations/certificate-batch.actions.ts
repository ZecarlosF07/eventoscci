"use server";

import { z } from "zod";

import { getCertificateBatchStatus } from "@/features/certificates/queries/get-certificate-batch-status";
import { processCertificateBatchItem } from "@/features/certificates/services/process-certificate-batch-item";
import type { CertificateBatchActionResult } from "@/features/certificates/types/certificate-batch.types";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function startCertificateBatchAction(
  activityId: string, templateId: string, condition: string,
): Promise<CertificateBatchActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(activityId).success || !z.uuid().safeParse(templateId).success
    || !condition.trim() || condition.trim().length > 120) return { batch: null, message: "Selecciona plantilla y condición válidas." };
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("start_activity_certificate_batch", {
    p_activity_id: activityId, p_template_id: templateId, p_condition: condition.trim(),
  });
  if (error) return { batch: null, message: "No se pudo iniciar la tanda. Actualiza la página e inténtalo nuevamente." };
  if (!data) return { batch: null, message: "Ya no hay certificados elegibles o incompletos." };
  return { batch: await getCertificateBatchStatus(activityId) };
}

export async function processNextCertificateBatchAction(
  activityId: string, batchId: string,
): Promise<CertificateBatchActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(activityId).success || !z.uuid().safeParse(batchId).success)
    return { batch: null, message: "La tanda no es válida.", stop: true };
  const before = await getCertificateBatchStatus(activityId);
  if (!before || before.id !== batchId) return { batch: before, message: "Esta tanda ya no es la activa.", stop: true };
  const processed = await processCertificateBatchItem(batchId);
  const batch = await getCertificateBatchStatus(activityId);
  return {
    batch,
    processedCode: processed.code,
    message: processed.outcome === "failed" ? "Un certificado falló. Revisa el motivo y pulsa Reanudar para volver a intentarlo."
      : processed.outcome === "blocked" ? "Se omitió una persona que ya no cumple las condiciones."
        : processed.outcome === "busy" ? "Otro proceso aún trabaja en esta tanda; vuelve a intentarlo en unos minutos." : undefined,
    stop: processed.outcome === "failed" || processed.outcome === "busy",
  };
}
