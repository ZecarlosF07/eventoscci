import Image from "next/image";

import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { ActivitySpeakersProps } from "@/features/activities/components/ActivitySpeakers/types/activity-speakers.types";
import { getSpeakerImageUrl } from "@/features/speakers/utils/speaker-image";

export function ActivitySpeakers({ speakers }: ActivitySpeakersProps) {
  if (!speakers.length) return null;
  return (
    <section>
      <Heading level={2}>Expositores</Heading>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {speakers.map((speaker) => (
          <article className="overflow-hidden rounded-3xl border border-cci-100 bg-white p-5 shadow-sm" key={speaker.id}>
            <div className="flex items-center gap-4">
              {getSpeakerImageUrl(speaker.photo_path) ? <Image alt={`Fotografía de ${speaker.first_names} ${speaker.last_names}`} className="size-20 rounded-2xl object-cover" height={80} src={getSpeakerImageUrl(speaker.photo_path)!} width={80} /> : <span aria-hidden="true" className="grid size-20 place-items-center rounded-2xl bg-cci-950 text-2xl font-bold text-cci-lime">{speaker.first_names.charAt(0)}{speaker.last_names.charAt(0)}</span>}
              <div><Heading level={3}>{speaker.first_names} {speaker.last_names}</Heading>{speaker.roleLabel ? <Text className="font-medium text-cci-700" size="sm">{speaker.roleLabel}</Text> : null}{speaker.professional_title ? <Text size="sm">{speaker.professional_title}</Text> : null}{speaker.organization ? <Text size="sm">{speaker.organization}</Text> : null}</div>
            </div>
            {speaker.bio ? <Text className="mt-4" size="sm">{speaker.bio}</Text> : null}
            {speaker.specialties.length ? <div className="mt-4 flex flex-wrap gap-2">{speaker.specialties.map((specialty) => <span className="rounded-full bg-cci-50 px-3 py-1 text-xs font-semibold text-cci-800" key={specialty}>{specialty}</span>)}</div> : null}
            {speaker.linkedin_url || speaker.website_url ? <div className="mt-4 flex gap-4 text-sm font-semibold text-cci-800">{speaker.linkedin_url ? <a href={speaker.linkedin_url} rel="noreferrer" target="_blank">LinkedIn ↗</a> : null}{speaker.website_url ? <a href={speaker.website_url} rel="noreferrer" target="_blank">Sitio web ↗</a> : null}</div> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
