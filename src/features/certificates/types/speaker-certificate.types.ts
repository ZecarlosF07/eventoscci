import type { ActivityType } from "@/features/activities/types/activity.types";
import type { CertificateStatus, CertificateTemplate } from "@/features/certificates/types/certificate.types";
import type { SpeakerDocumentContext } from "@/features/speakers/types/speaker-document.types";

export interface SpeakerCertificateActivity {
  id: string;
  issuedCount: number;
  pendingCount: number;
  speakerCount: number;
  title: string;
  type: ActivityType;
}

export interface SpeakerCertificateActivityPage {
  activities: SpeakerCertificateActivity[];
  page: number;
  pageCount: number;
  total: number;
}

export interface SpeakerCertificateCandidate {
  documentContext: SpeakerDocumentContext;
  certificateName: string | null;
  accessToken: string | null;
  certificateCode: string | null;
  certificateId: string | null;
  certificateStatus: CertificateStatus | null;
  email: string | null;
  filePath: string | null;
  firstNames: string;
  lastNames: string;
  organization: string | null;
  photoPath: string | null;
  roleLabel: string;
  speakerId: string;
}

export interface SpeakerCertificateActivityData {
  activity: { id: string; title: string; type: ActivityType; status: string };
  candidates: SpeakerCertificateCandidate[];
  templates: CertificateTemplate[];
}

export interface SpeakerCertificateIssueState {
  errorCount?: number;
  issuedCount?: number;
  message?: string;
  processedSpeakerIds?: string[];
  success?: boolean;
}

export interface SpeakerCertificateRecipientInput {
  fullName?: string;
  role: string;
  speakerId: string;
}

export interface SpeakerCertificatesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export interface SpeakerCertificateDetailPageProps {
  params: Promise<{ activityId: string }>;
}

export interface SpeakerCertificateActivityListProps {
  activities: SpeakerCertificateActivity[];
}

export interface SpeakerCertificateTableProps {
  readOnly?: boolean;
  activityId: string;
  candidates: SpeakerCertificateCandidate[];
  templates: CertificateTemplate[];
}

export interface SpeakerCertificateActionsProps {
  activityId: string;
  candidate: SpeakerCertificateCandidate;
  readOnly: boolean;
}

export interface SpeakerCertificateNameFieldProps {
  disabled: boolean;
  editable: boolean;
  onChange: (name: string) => void;
  speakerId: string;
  value: string;
}
