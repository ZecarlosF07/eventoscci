import "server-only";

import { CERTIFICATE_BUCKET } from "@/features/certificates/constants/certificate.constants";
import { getCertificateGenerationData } from "@/features/certificates/queries/get-certificate-generation-data";
import { certificateBatchClaimSchema } from "@/features/certificates/schemas/certificate-batch.schema";
import { prepareCertificateResultSchema } from "@/features/certificates/schemas/certificate-mutation.schema";
import { storeCertificatePdf } from "@/features/certificates/services/store-certificate-pdf";
import type { CertificateBatchClaim } from "@/features/certificates/types/certificate-batch.types";
import { deliverNotificationImmediately } from "@/features/notifications/services/process-notifications";
import { getSiteUrl } from "@/lib/env/server-env";
import { logger } from "@/lib/observability/logger";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function finishClaim(claim: CertificateBatchClaim, state: "blocked" | "failed" | "issued", reason?: string) {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("finish_activity_certificate_batch_item", {
    p_item_id: claim.item_id,
    p_lease_token: claim.lease_token,
    p_state: state,
    p_error: reason ?? "",
  });
  if (error) throw new Error("No se pudo guardar el avance de la tanda.", { cause: error });
  return data;
}

async function findOrPrepareCertificate(claim: CertificateBatchClaim) {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("prepare_activity_certificates", {
    p_registration_ids: [claim.registration_id],
    p_template_id: claim.template_id,
    p_condition: claim.condition,
  });
  if (error) throw new Error("No se pudo preparar el certificado.", { cause: error });
  const result = prepareCertificateResultSchema.parse(data);
  if (result.rejected.length) return { blocked: result.rejected[0].reason, certificateId: null, ready: false };
  const existing = result.existing[0];
  return {
    blocked: null,
    certificateId: existing?.certificate_id ?? result.prepared[0]?.certificate_id ?? null,
    ready: existing?.file_ready ?? false,
  };
}

export async function processCertificateBatchItem(batchId: string): Promise<{ code?: string; outcome: "blocked" | "busy" | "failed" | "issued" }> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("claim_activity_certificate_batch_item", { p_batch_id: batchId });
  if (error) throw new Error("No se pudo tomar el siguiente certificado.", { cause: error });
  if (data === null) return { outcome: "busy" };
  const claim = certificateBatchClaimSchema.parse(data);
  const { data: registration } = await client.from("registrations")
    .select("registration_code").eq("id", claim.registration_id).maybeSingle();
  const code = registration?.registration_code ?? undefined;
  if (!claim.eligible) {
    await finishClaim(claim, "blocked", "Ya no cumple las condiciones de emisión.");
    return { code, outcome: "blocked" };
  }

  let uploadedPath: string | null = null;
  try {
    const prepared = await findOrPrepareCertificate(claim);
    if (prepared.blocked || !prepared.certificateId) {
      await finishClaim(claim, "blocked", prepared.blocked ?? "No se pudo preparar este certificado.");
      return { code, outcome: "blocked" };
    }
    if (prepared.ready) {
      await finishClaim(claim, "issued");
      return { code, outcome: "issued" };
    }
    const certificate = await getCertificateGenerationData(prepared.certificateId);
    if (!certificate) throw new Error("El certificado ya no está disponible.");
    uploadedPath = `issued/${certificate.id}/${claim.lease_token}.pdf`;
    await storeCertificatePdf(client, certificate, getSiteUrl(), uploadedPath);
    const finalized = await client.rpc("finalize_activity_certificate_batch_item", {
      p_item_id: claim.item_id,
      p_lease_token: claim.lease_token,
      p_certificate_id: certificate.id,
      p_file_path: uploadedPath,
      p_public_base_url: getSiteUrl(),
    });
    if (finalized.error || !finalized.data) throw new Error("La emisión cambió mientras se generaba. Se podrá reanudar.", { cause: finalized.error });
    uploadedPath = null;
    await deliverNotificationImmediately({
      eventType: "activity_certificate_issued",
      relatedEntityId: certificate.id,
      relatedEntityType: "certificate",
    });
    return { code, outcome: "issued" };
  } catch (processError) {
    if (uploadedPath) {
      const removed = await client.storage.from(CERTIFICATE_BUCKET).remove([uploadedPath]);
      if (removed.error) logger.warn("certificate_batch_orphan_pdf", { path: uploadedPath });
    }
    const reason = processError instanceof Error ? processError.message : "Error no identificado";
    try { await finishClaim(claim, reason.includes("CERTIFICATE_NOT_ELIGIBLE") ? "blocked" : "failed", reason); }
    catch (finishError) { logger.error("certificate_batch_item_finish_failed", { error: finishError instanceof Error ? finishError.message : "Unknown", itemId: claim.item_id }); }
    logger.error("certificate_batch_item_failed", { itemId: claim.item_id, reason });
    return { code, outcome: "failed" };
  }
}
