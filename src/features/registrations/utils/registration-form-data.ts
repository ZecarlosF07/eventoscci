import type { RegistrationInput } from "@/features/registrations/types/registration.types";

function formValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function parseRegistrationFormData(formData: FormData): RegistrationInput {
  const registrationType = formValue(formData, "registration_type") === "member" ? "member" : "general";
  const participantProfile = registrationType === "member"
    ? "professional"
    : formValue(formData, "participant_profile") === "student" ? "student" : "professional";
  const isStudent = participantProfile === "student";

  return {
    academic_institution: isStudent ? formValue(formData, "academic_institution") : "",
    address: isStudent ? "" : formValue(formData, "address"),
    career: isStudent ? formValue(formData, "career") : "",
    company: isStudent ? "" : formValue(formData, "company"),
    document_number: formValue(formData, "document_number"),
    document_type: formValue(formData, "document_type") === "ce" ? "ce" : "dni",
    email: formValue(formData, "email"),
    first_names: formValue(formData, "first_names"),
    future_topics_suggestion: formValue(formData, "future_topics_suggestion"),
    job_title: isStudent ? "" : formValue(formData, "job_title"),
    last_names: formValue(formData, "last_names"),
    phone: formValue(formData, "phone"),
    participant_profile: participantProfile,
    registration_type: registrationType,
    request_certificate: formData.get("request_certificate") === "on",
    ruc: isStudent ? "" : formValue(formData, "ruc"),
  };
}
