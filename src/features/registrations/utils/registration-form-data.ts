import type { RegistrationInput } from "@/features/registrations/types/registration.types";

function formValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function parseRegistrationFormData(formData: FormData): RegistrationInput {
  return {
    address: formValue(formData, "address"),
    company: formValue(formData, "company"),
    document_number: formValue(formData, "document_number"),
    document_type: formValue(formData, "document_type") === "ce" ? "ce" : "dni",
    email: formValue(formData, "email"),
    first_names: formValue(formData, "first_names"),
    job_title: formValue(formData, "job_title"),
    last_names: formValue(formData, "last_names"),
    phone: formValue(formData, "phone"),
    registration_type:
      formValue(formData, "registration_type") === "member" ? "member" : "general",
    ruc: formValue(formData, "ruc"),
  };
}
