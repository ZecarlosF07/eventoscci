import type { RegistrationErrorCode } from "@/features/registrations/types/registration.types";

const REGISTRATION_ERROR_CODES: readonly RegistrationErrorCode[] = [
  "ACTIVITY_NOT_FOUND",
  "DATABASE_ERROR",
  "DUPLICATE_REGISTRATION",
  "INVALID_MEMBER_DATA",
  "NO_AVAILABLE_CAPACITY",
  "REGISTRATION_CLOSED",
  "VALIDATION_ERROR",
];

export function getRegistrationErrorCode(message: string): RegistrationErrorCode {
  return (
    REGISTRATION_ERROR_CODES.find((code) => message.includes(code)) ??
    "DATABASE_ERROR"
  );
}
