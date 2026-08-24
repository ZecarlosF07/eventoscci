"use client";

import { useState } from "react";

import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Text } from "@/components/atoms/Text";
import type { CourseInstructorFieldsProps } from "@/features/courses/components/CourseInstructorFields/types/course-instructor-fields.types";

export function CourseInstructorFields({ initialInstructors, speakers }: CourseInstructorFieldsProps) {
  const [selected, setSelected] = useState(initialInstructors.map((item) => item.speaker_id));
  const initialPrimary = initialInstructors.find((item) => item.is_primary)?.speaker_id ?? "";

  function toggleSpeaker(id: string) {
    setSelected((current) => current.includes(id)
      ? current.filter((speakerId) => speakerId !== id)
      : [...current, id]);
  }

  if (!speakers.length) return <Text>No hay expositores activos disponibles.</Text>;

  return <div className="grid gap-3 md:grid-cols-2">
    {speakers.map((speaker) => {
      const isSelected = selected.includes(speaker.id);
      const initial = initialInstructors.find((item) => item.speaker_id === speaker.id);
      return <div className="rounded-2xl border border-cci-100 p-4" key={speaker.id}>
        <Label className="flex items-start gap-3" htmlFor={`instructor_${speaker.id}`}>
          <Checkbox checked={isSelected} id={`instructor_${speaker.id}`} name="instructor_id" onChange={() => toggleSpeaker(speaker.id)} value={speaker.id} />
          <span>{speaker.first_names} {speaker.last_names}{speaker.organization ? <span className="block text-sm font-normal text-slate-500">{speaker.organization}</span> : null}</span>
        </Label>
        {isSelected ? <div className="mt-3 space-y-3">
          <Label className="flex items-center gap-2" htmlFor={`primary_${speaker.id}`}>
            <input defaultChecked={initialPrimary === speaker.id} id={`primary_${speaker.id}`} name="primary_instructor_id" type="radio" value={speaker.id} /> Principal
          </Label>
          <div className="grid grid-cols-[1fr_90px] gap-2">
            <Input defaultValue={initial?.role_label ?? ""} name={`instructor_role_${speaker.id}`} placeholder="Rol docente" />
            <Input aria-label={`Orden de ${speaker.first_names}`} defaultValue={initial?.sort_order ?? selected.indexOf(speaker.id)} min="0" name={`instructor_order_${speaker.id}`} type="number" />
          </div>
        </div> : null}
      </div>;
    })}
  </div>;
}
