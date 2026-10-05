import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { ActivityInformationProps } from "@/features/activities/components/ActivityInformation/types/activity-information.types";
import { getLegacyActivityProgram } from "@/features/activities/utils/activity-program";
import { PROFESSIONAL_ACTIVITY_NOTICE } from "@/features/registrations/constants/registration.constants";

const GENERAL_INFO_FIELDS = [
  ["Objetivo", "objective"],
  ["Dirigido a", "target_audience"],
] as const;

export function ActivityInformation({ activity }: ActivityInformationProps) {
  const legacyProgram = getLegacyActivityProgram(activity.program, activity.syllabus);
  const showLegacyProgram = legacyProgram && (activity.type === "event" || !activity.program_image_paths?.length);
  return (
    <div className="space-y-8">
      {!activity.members_only && !activity.allows_student_registration ? <Text className="font-semibold">{PROFESSIONAL_ACTIVITY_NOTICE}</Text> : null}
      <section>
        <Heading level={2}>Acerca de la actividad</Heading>
        <Text className="mt-3 whitespace-pre-line [overflow-wrap:anywhere]">{activity.description}</Text>
      </section>
      {GENERAL_INFO_FIELDS.map(([label, field]) => {
        const value = activity[field];
        return value ? (
          <section key={field}>
            <Heading level={2}>{label}</Heading>
            <Text className="mt-2 whitespace-pre-line [overflow-wrap:anywhere]">{value}</Text>
          </section>
        ) : null;
      })}
      {showLegacyProgram ? <section><Heading level={2}>Programa</Heading><Text className="mt-2 whitespace-pre-line [overflow-wrap:anywhere]">{legacyProgram}</Text></section> : null}
      {activity.additional_info ? <section><Heading level={2}>Información adicional</Heading><Text className="mt-2 whitespace-pre-line [overflow-wrap:anywhere]">{activity.additional_info}</Text></section> : null}
    </div>
  );
}
