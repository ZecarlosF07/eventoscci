import { Badge } from "@/components/atoms/Badge";
import type { BadgeVariant } from "@/components/atoms/Badge/types/badge.types";
import type { AttendanceStatusBadgeProps } from "@/features/attendance/components/AttendanceStatusBadge/types/attendance-status-badge.types";

const LABELS = { absent: "No asistió", attended: "Asistió", pending: "Pendiente" } as const;
const VARIANTS: Record<keyof typeof LABELS, BadgeVariant> = {
  absent: "warning",
  attended: "success",
  pending: "neutral",
};

export function AttendanceStatusBadge({ status }: AttendanceStatusBadgeProps) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
