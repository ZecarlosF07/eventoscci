import type { RegistrationAdminItem } from "@/features/registrations/types/registration.types";

export interface RegistrationRowActionsProps {
  registration: RegistrationAdminItem;
  returnTo: string;
}
