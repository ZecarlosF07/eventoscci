import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { ActivityInformationProps } from "@/features/activities/components/ActivityInformation/types/activity-information.types";
import { getLegacyActivityProgram } from "@/features/activities/utils/activity-program";

const GENERAL_INFO_FIELDS = [
  ["Objetivo", "objective"],
  ["Dirigido a", "target_audience"],
] as const;

export function ActivityInformation({ activity }: ActivityInformationProps) {
  const legacyProgram = getLegacyActivityProgram(activity.program, activity.syllabus);
  const showLegacyProgram = !activity.program_image_paths?.length && legacyProgram;
  return (
    <div className="space-y-8">
      <section>
        <Heading level={2}>Acerca de la actividad</Heading>
        <Text className="mt-3 whitespace-pre-line">{activity.description}</Text>
      </section>
      {GENERAL_INFO_FIELDS.map(([label, field]) => {
        const value = activity[field];
        return value ? (
          <section key={field}>
            <Heading level={3}>{label}</Heading>
            <Text className="mt-2 whitespace-pre-line">{value}</Text>
          </section>
        ) : null;
      })}
      {showLegacyProgram ? <section><Heading level={3}>Programa</Heading><Text className="mt-2 whitespace-pre-line">{legacyProgram}</Text></section> : null}
      {activity.additional_info ? <section><Heading level={3}>Información adicional</Heading><Text className="mt-2 whitespace-pre-line">{activity.additional_info}</Text></section> : null}
    </div>
  );
}
