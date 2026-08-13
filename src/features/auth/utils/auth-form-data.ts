import type { CampusRegistrationMetadata } from "@/features/auth/types/auth.types";

export function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function registrationMetadata(data: Omit<CampusRegistrationMetadata, "registration_source">): CampusRegistrationMetadata {
  return { ...data, registration_source: "campus" };
}
