import type { Enums, Tables } from "@/lib/supabase/database.types";

export type UserRole = Enums<"user_role">;
export type PersonProfile = Pick<Tables<"people">,
  "address" | "company" | "document_number" | "document_type" | "email" |
  "first_names" | "id" | "job_title" | "last_names" | "phone" | "ruc"
>;

export interface CurrentAccount {
  email: string;
  isActive: boolean;
  person: PersonProfile;
  role: UserRole;
  userId: string;
}

export type AdminSession = CurrentAccount;

export interface LoginActionState {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string;
}

export interface RegisterActionState {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}

export interface PasswordActionState {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}

export interface LoginFormProps {
  next?: string;
  portal?: "admin" | "public";
}

export interface AuthPageSearchParams {
  error?: string | string[];
  next?: string | string[];
}

export interface AuthPageProps {
  searchParams: Promise<AuthPageSearchParams>;
}

export interface AuthCallbackContext {
  searchParams: URLSearchParams;
}

export interface AccountAccess {
  isActive: boolean;
  role: UserRole;
}

export interface CampusRegistrationMetadata {
  address: string;
  company: string;
  document_number: string;
  document_type: "dni" | "ce";
  first_names: string;
  job_title: string;
  last_names: string;
  phone: string;
  registration_source: "campus";
  ruc: string;
}
