import Link from "next/link";

import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { ParticipantDetailTemplateProps } from "@/components/templates/ParticipantDetailTemplate/types/participant-detail-template.types";
import { ROUTES } from "@/constants/routes";
import { ParticipantForm } from "@/features/participants/components/ParticipantForm";
import { ParticipantHistory } from "@/features/participants/components/ParticipantHistory";

export function ParticipantDetailTemplate({ participant }: ParticipantDetailTemplateProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link className="text-sm font-semibold text-slate-700 hover:underline" href={ROUTES.adminParticipants}>← Volver a participantes</Link>
        <div><Text as="p" className="font-semibold uppercase tracking-[0.16em]" size="sm">Ficha institucional</Text><Heading level={1}>{participant.first_names} {participant.last_names}</Heading><Text>{participant.registrations.length} participaciones registradas.</Text></div>
      </div>
      <section className="space-y-4"><Heading level={2}>Datos actuales</Heading><Text>Las correcciones no modifican la empresa, RUC ni precio guardados históricamente en cada inscripción.</Text><ParticipantForm participant={participant} /></section>
      <section className="space-y-4"><Heading level={2}>Historial de actividades</Heading><ParticipantHistory history={participant.registrations} /></section>
    </div>
  );
}
