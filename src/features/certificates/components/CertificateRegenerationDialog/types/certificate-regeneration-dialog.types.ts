import type { FormEventHandler } from "react";

import type { ParticipantCertificateItem } from "@/features/participants/types/participant.types";

export interface CertificateRegenerationDialogProps {
  certificates: ParticipantCertificateItem[];
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  participantName: string;
  pending: boolean;
}
