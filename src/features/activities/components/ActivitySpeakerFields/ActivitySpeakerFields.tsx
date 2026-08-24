"use client";

import { useState } from "react";

import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Text } from "@/components/atoms/Text";
import type { ActivitySpeakerFieldsProps } from "@/features/activities/components/ActivitySpeakerFields/types/activity-speaker-fields.types";

export function ActivitySpeakerFields({
  initialSpeakers,
  speakers,
}: ActivitySpeakerFieldsProps) {
  const initialIds = initialSpeakers.map((speaker) => speaker.speaker_id);
  const [selected, setSelected] = useState(initialIds);

  function toggleSpeaker(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((speakerId) => speakerId !== id)
        : [...current, id],
    );
  }

  if (!speakers.length) {
    return <Text>No hay expositores activos disponibles.</Text>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {speakers.map((speaker) => {
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
              <span>
                {speaker.first_names} {speaker.last_names}
                {speaker.organization ? (
                  <span className="block text-sm font-normal text-slate-500">
                    {speaker.organization}
                  </span>
                ) : null}
              </span>
            </Label>
            {isSelected ? (
              <div className="mt-3 grid grid-cols-[1fr_90px] gap-2">
                <Input
                  defaultValue={initialRole ?? ""}
                  name={`speaker_role_${speaker.id}`}
                  placeholder="Rol: ponente, moderador…"
                />
                <Input
                  aria-label={`Orden de ${speaker.first_names} ${speaker.last_names}`}
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
  );
}
