import { notFound } from "next/navigation";

import { ParticipantDetailTemplate } from "@/components/templates/ParticipantDetailTemplate";
import { getParticipantById } from "@/features/participants/queries/get-participant-by-id";
import type { ParticipantDetailPageProps } from "@/features/participants/types/participant.types";
import { ParticipantPrivacyPanel } from "@/features/privacy/components/ParticipantPrivacyPanel";

export default async function ParticipantDetailPage({ params }: ParticipantDetailPageProps) {
  const { id } = await params;
  const participant = await getParticipantById(id);
  if (!participant) notFound();
  return <><ParticipantDetailTemplate participant={participant} /><ParticipantPrivacyPanel personId={id} /></>;
}
