import type { ParticipantProfile } from "@/features/registrations/types/registration.types";

export function isStudentRegistrationRestricted(allowsStudentRegistration: boolean, profile: ParticipantProfile) {
  return !allowsStudentRegistration && profile === "student";
}
