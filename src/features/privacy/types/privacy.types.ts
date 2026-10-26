export interface PrivacyInput {
  privacy_accepted?: boolean;
  privacy_version?: string;
  marketing_accepted?: boolean;
}

export interface PrivacyFieldsProps {
  context?: "individual" | "group" | "campus";
  errors?: Record<string, string[]>;
  idPrefix?: string;
  onChange?: (input: PrivacyInput) => void;
  value?: PrivacyInput;
}

export interface PrivacyFormState {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}

export interface CampusPrivacyPageProps {
  searchParams: Promise<{ curso?: string }>;
}

export interface CampusPrivacyFormProps { courseId: string }
export interface ParticipantPrivacyPanelProps { personId: string }
export interface WithdrawMarketingFormProps { personId: string; enabled: boolean }
