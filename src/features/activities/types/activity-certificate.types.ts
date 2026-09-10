export type ActivityCertificateMode = "included" | "none" | "optional_paid";

export interface ActivityCertificateConfiguration {
  certificateGeneralPrice: number;
  certificateMemberPrice: number;
  certificateMode: ActivityCertificateMode;
}
