import type { RegistrationType } from "@/features/registrations/types/registration.types";

export interface CertificateRequestWhatsAppInput {
  activityTitle: string;
  certificatePrice: number;
  phone: string;
  registrationCode: string;
  registrationType: RegistrationType;
}

export type CertificateRequestActionResult =
  | { message: string; success: false }
  | { success: true; url: string };

export interface CertificateRequestCardProps {
  alreadyRequested: boolean;
  certificatePrice: number;
  registrationCode: string;
  requestToken: string;
}
