export interface SpeakerDocumentContext {
  canCorrect: boolean;
  documentNumber: string | null;
  hasCertificates: boolean;
}

export interface SpeakerDocumentState {
  conflict?: { name: string; speakerId: string };
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}

export interface SpeakerDocumentEditorProps {
  inline?: boolean;
  onPendingChange?: (pending: boolean) => void;
  onSaved?: () => void;
  context: SpeakerDocumentContext;
  disabled?: boolean;
  speakerId: string;
}
