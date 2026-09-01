"use client";

import Image from "next/image";
import { useState } from "react";

import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Text } from "@/components/atoms/Text";
import type { ActivitySpeakerFieldsProps } from "@/features/activities/components/ActivitySpeakerFields/types/activity-speaker-fields.types";
import { CatalogQuickCreateDialog } from "@/features/catalogs/components/CatalogQuickCreateDialog";
import type { CatalogOption } from "@/features/catalogs/types/catalog.types";
import { getSpeakerImageUrl } from "@/features/speakers/utils/speaker-image";

export function ActivitySpeakerFields({
  initialSpeakers,
  speakers,
}: ActivitySpeakerFieldsProps) {
  const initialIds = initialSpeakers.map((speaker) => speaker.speaker_id);
  const [selected, setSelected] = useState(initialIds);
  const [options, setOptions] = useState<CatalogOption[]>(speakers.map((speaker) => ({
    description: [speaker.professional_title, speaker.organization].filter(Boolean).join(" · "),
    id: speaker.id,
    imageUrl: getSpeakerImageUrl(speaker.photo_path),
    label: `${speaker.first_names} ${speaker.last_names}`,
  })));

  function toggleSpeaker(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((speakerId) => speakerId !== id)
        : [...current, id],
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4"><Text>Selecciona uno o varios perfiles.</Text><CatalogQuickCreateDialog kind="speakers" onCreated={(option) => setOptions((current) => [...current, option])} /></div>
      {!options.length ? <Text>No hay expositores activos disponibles.</Text> : null}
      <div className="grid gap-3 md:grid-cols-2">
      {options.map((speaker) => {
        const isSelected = selected.includes(speaker.id);
        const initialRole = initialSpeakers.find(
          (item) => item.speaker_id === speaker.id,
        )?.role_label;

        return (
          <div className="rounded-2xl border border-cci-100 p-4" key={speaker.id}>
            <Label className="flex items-start gap-3" htmlFor={`speaker_${speaker.id}`}>
              <Checkbox
                checked={isSelected}
                id={`speaker_${speaker.id}`}
                name="speaker_id"
                onChange={() => toggleSpeaker(speaker.id)}
                value={speaker.id}
              />
              {speaker.imageUrl ? <Image alt="" className="size-11 rounded-full object-cover" height={44} src={speaker.imageUrl} width={44} /> : <span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-cci-100 font-bold text-cci-800">{speaker.label.charAt(0)}</span>}
              <span>
                {speaker.label}
                {speaker.description ? <span className="block text-sm font-normal text-slate-500">{speaker.description}</span> : null}
              </span>
            </Label>
            {isSelected ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_90px]">
                <Input
                  defaultValue={initialRole ?? ""}
                  name={`speaker_role_${speaker.id}`}
                  placeholder="Rol: ponente, moderador…"
                />
                <Input
                  aria-label={`Orden de ${speaker.label}`}
                  defaultValue={
                    initialSpeakers.find((item) => item.speaker_id === speaker.id)
                      ?.sort_order ?? selected.indexOf(speaker.id)
                  }
                  min="0"
                  name={`speaker_order_${speaker.id}`}
                  type="number"
                />
              </div>
            ) : null}
          </div>
        );
      })}
      </div>
    </div>
  );
}
