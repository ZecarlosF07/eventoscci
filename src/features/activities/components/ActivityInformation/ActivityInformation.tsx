import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { ActivityInformationProps } from "@/features/activities/components/ActivityInformation/types/activity-information.types";

const INFO_FIELDS = [
  ["Objetivo", "objective"],
  ["Dirigido a", "target_audience"],
  ["Programa", "program"],
  ["Temario", "syllabus"],
  ["Información adicional", "additional_info"],
] as const;

export function ActivityInformation({ activity }: ActivityInformationProps) {
  return (
    <div className="space-y-8">
      <section>
        <Heading level={2}>Acerca de la actividad</Heading>
        <Text className="mt-3 whitespace-pre-line">{activity.description}</Text>
      </section>
      {INFO_FIELDS.map(([label, field]) => {
        const value = activity[field];
        return value ? (
          <section key={field}>
            <Heading level={3}>{label}</Heading>
            <Text className="mt-2 whitespace-pre-line">{value}</Text>
          </section>
        ) : null;
      })}
    </div>
  );
}
