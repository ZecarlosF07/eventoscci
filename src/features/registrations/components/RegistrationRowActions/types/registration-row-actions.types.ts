import type { RegistrationAdminItem } from "@/features/registrations/types/registration.types";

export interface RegistrationRowActionsProps {
  registration: RegistrationAdminItem;
  returnTo: string;
}

export interface RegistrationCancelDialogProps extends RegistrationRowActionsProps {
  mode: RegistrationActionMode;
  onClose: () => void;
}

export type RegistrationActionMode = "cancel" | "reactivate";
