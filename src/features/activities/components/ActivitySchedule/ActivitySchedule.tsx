import { Heading } from "@/components/atoms/Heading";
import { ActivityDate } from "@/components/molecules/ActivityDate";
import type { ActivityScheduleProps } from "@/features/activities/components/ActivitySchedule/types/activity-schedule.types";

export function ActivitySchedule({ dates }: ActivityScheduleProps) {
  if (!dates.length) return null;
  return (
    <section>
      <Heading level={2}>Fechas y horarios</Heading>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {dates.map((date) => <ActivityDate date={date} key={date.id} />)}
      </div>
    </section>
  );
}
