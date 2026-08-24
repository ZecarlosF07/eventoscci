import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { ActivitySpeakersProps } from "@/features/activities/components/ActivitySpeakers/types/activity-speakers.types";

export function ActivitySpeakers({ speakers }: ActivitySpeakersProps) {
  if (!speakers.length) return null;
  return (
    <section>
      <Heading level={2}>Expositores</Heading>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {speakers.map((speaker) => (
          <article className="rounded-2xl border border-cci-100 bg-white p-5" key={speaker.id}>
            <Heading level={3}>{speaker.first_names} {speaker.last_names}</Heading>
            {speaker.roleLabel ? <Text className="font-medium text-slate-800" size="sm">{speaker.roleLabel}</Text> : null}
            {speaker.professional_title ? <Text size="sm">{speaker.professional_title}</Text> : null}
            {speaker.organization ? <Text size="sm">{speaker.organization}</Text> : null}
            {speaker.bio ? <Text className="mt-3" size="sm">{speaker.bio}</Text> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
