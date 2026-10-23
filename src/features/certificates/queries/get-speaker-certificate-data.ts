import "server-only";

import { z } from "zod";

import { getCertificateTemplates } from "@/features/certificates/queries/get-certificate-templates";
import type {
  SpeakerCertificateActivityData,
  SpeakerCertificateCandidate,
} from "@/features/certificates/types/speaker-certificate.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSpeakerDocuments } from "@/features/speakers/queries/get-speaker-documents";

export async function getSpeakerCertificateData(
  activityId: string,
): Promise<SpeakerCertificateActivityData | null> {
  if (!z.uuid().safeParse(activityId).success) return null;
  const client = await createServerSupabaseClient();
  const [activityResult, candidateResult, certificatesResult, templates] = await Promise.all([
    client.from("activities").select("id, title, type, status").eq("id", activityId)
      .is("deleted_at", null).maybeSingle(),
    client.rpc("get_speaker_certificate_candidates", { p_activity_id: activityId }),
    client.from("certificates").select("speaker_id, participant_name_snapshot")
      .eq("activity_id", activityId).eq("recipient_type", "speaker").is("deleted_at", null),
    getCertificateTemplates(true),
  ]);
  if (activityResult.error) throw new Error("No fue posible consultar la actividad.", { cause: activityResult.error });
  if (!activityResult.data) return null;
  if (candidateResult.error) throw new Error("No fue posible consultar los ponentes de la actividad.", { cause: candidateResult.error });
  if (certificatesResult.error) throw new Error("No fue posible consultar los nombres certificados.", { cause: certificatesResult.error });
  const certificateNames = new Map((certificatesResult.data ?? []).map((item) => [item.speaker_id, item.participant_name_snapshot]));
  const documents = await getSpeakerDocuments((candidateResult.data ?? []).map((item) => item.speaker_id));
  const candidates: SpeakerCertificateCandidate[] = (candidateResult.data ?? []).map((item) => ({
    documentContext: documents.get(item.speaker_id) ?? { canCorrect: false, documentNumber: null, hasCertificates: false },
    certificateName: certificateNames.get(item.speaker_id) ?? null,
    accessToken: item.access_token,
    certificateCode: item.certificate_code,
    certificateId: item.certificate_id,
    certificateStatus: item.certificate_status,
    email: item.email,
    filePath: item.file_path,
    firstNames: item.first_names,
    lastNames: item.last_names,
    organization: item.organization,
    photoPath: item.photo_path,
    roleLabel: item.role_label,
    speakerId: item.speaker_id,
  }));
  return {
    activity: activityResult.data,
    candidates,
    templates: templates.filter((template) => template.scope === "activity"),
  };
}
