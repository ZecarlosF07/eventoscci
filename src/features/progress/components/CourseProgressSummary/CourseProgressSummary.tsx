import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { ProgressBar } from "@/features/progress/components/ProgressBar";
import type { CourseProgressSummaryProps } from "@/features/progress/components/CourseProgressSummary/types/course-progress-summary.types";

export function CourseProgressSummary({
  completedLessons,
  pendingLessons,
  progressPercent,
  totalLessons,
}: CourseProgressSummaryProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Heading level={2}>Tu progreso</Heading>
      <ProgressBar className="mt-4" label="Avance del curso" value={progressPercent} />
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 p-3">
          <Text size="sm">Completadas</Text>
          <p className="mt-1 text-xl font-semibold text-slate-950">
            {completedLessons} de {totalLessons}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <Text size="sm">Pendientes</Text>
          <p className="mt-1 text-xl font-semibold text-slate-950">{pendingLessons}</p>
        </div>
      </div>
      <Text className="mt-3" size="sm">
        Solo las clases obligatorias participan en este porcentaje.
      </Text>
    </section>
  );
}

