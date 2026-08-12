import { Badge } from "@/components/atoms/Badge";
import type { BadgeVariant } from "@/components/atoms/Badge/types/badge.types";
import { REGISTRATION_STATUS_LABELS } from "@/features/registrations/constants/registration.constants";
import type {
  RegistrationStatus,
  RegistrationStatusBadgeProps,
} from "@/features/registrations/types/registration.types";

const STATUS_VARIANTS: Record<RegistrationStatus, BadgeVariant> = {
  cancelled: "warning",
  confirmed: "success",
  pending: "warning",
};

export function RegistrationStatusBadge({ status }: RegistrationStatusBadgeProps) {
  return <Badge variant={STATUS_VARIANTS[status]}>{REGISTRATION_STATUS_LABELS[status]}</Badge>;
}
