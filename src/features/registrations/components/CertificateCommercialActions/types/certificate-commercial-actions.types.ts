export type CertificatePaymentDialogMode = "revert" | "verify";

export interface CertificateCommercialActionsProps {
  activityId: string;
  certificateIssued: boolean;
  certificatePaymentVerified: boolean;
  certificatePrice: number;
  certificateRequested: boolean;
  disabled: boolean;
  participantName: string;
  registrationConfirmed: boolean;
  registrationId: string;
  returnTo: string;
}

export interface CertificatePaymentDialogProps {
  activityId: string;
  certificatePrice: number;
  mode: CertificatePaymentDialogMode;
  onClose: () => void;
  participantName: string;
  registrationId: string;
  returnTo: string;
}
