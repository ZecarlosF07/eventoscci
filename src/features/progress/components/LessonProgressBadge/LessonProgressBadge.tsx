import { Badge } from "@/components/atoms/Badge";
import type { LessonProgressBadgeProps } from "@/features/progress/components/LessonProgressBadge/types/lesson-progress-badge.types";
import { getLessonProgressStatus } from "@/features/progress/utils/progress";

export function LessonProgressBadge({
  isCompleted = false,
  progressPercent = 0,
}: LessonProgressBadgeProps) {
  const value = Math.min(Math.max(Math.round(progressPercent), 0), 100);
  const status = getLessonProgressStatus(value, isCompleted);
  if (status === "completed") return <Badge variant="success">Completada · {value}%</Badge>;
  if (status === "in_progress") return <Badge variant="warning">En progreso · {value}%</Badge>;
  return <Badge>No iniciada · 0%</Badge>;
}

