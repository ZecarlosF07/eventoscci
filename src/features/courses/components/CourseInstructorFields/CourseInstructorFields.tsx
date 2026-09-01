"use client";

import Image from "next/image";
import { useState } from "react";

import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Text } from "@/components/atoms/Text";
import { CatalogQuickCreateDialog } from "@/features/catalogs/components/CatalogQuickCreateDialog";
import type { CatalogOption } from "@/features/catalogs/types/catalog.types";
import type { CourseInstructorFieldsProps } from "@/features/courses/components/CourseInstructorFields/types/course-instructor-fields.types";
import { getSpeakerImageUrl } from "@/features/speakers/utils/speaker-image";

export function CourseInstructorFields({ initialInstructors, speakers }: CourseInstructorFieldsProps) {
  const [selected, setSelected] = useState(initialInstructors.map((item) => item.speaker_id));
  const initialPrimary = initialInstructors.find((item) => item.is_primary)?.speaker_id ?? "";
  const [options, setOptions] = useState<CatalogOption[]>(speakers.map((speaker) => ({
    description: [speaker.professional_title, speaker.organization].filter(Boolean).join(" · "),
    id: speaker.id,
    imageUrl: getSpeakerImageUrl(speaker.photo_path),
    label: `${speaker.first_names} ${speaker.last_names}`,
  })));

  function toggleSpeaker(id: string) {
    setSelected((current) => current.includes(id)
      ? current.filter((speakerId) => speakerId !== id)
      : [...current, id]);
  }

  return <div className="grid gap-3 md:grid-cols-2">
    <div className="flex items-center justify-between gap-3 md:col-span-2"><Text>Selecciona los instructores del curso.</Text><CatalogQuickCreateDialog kind="speakers" onCreated={(option) => setOptions((current) => [...current, option])} /></div>
    {!options.length ? <Text>No hay expositores activos disponibles.</Text> : null}
    {options.map((speaker) => {
      const isSelected = selected.includes(speaker.id);
      const initial = initialInstructors.find((item) => item.speaker_id === speaker.id);
      return <div className="rounded-2xl border border-cci-100 p-4" key={speaker.id}>
        <Label className="flex items-start gap-3" htmlFor={`instructor_${speaker.id}`}>
          <Checkbox checked={isSelected} id={`instructor_${speaker.id}`} name="instructor_id" onChange={() => toggleSpeaker(speaker.id)} value={speaker.id} />
          {speaker.imageUrl ? <Image alt="" className="size-10 rounded-full object-cover" height={40} src={speaker.imageUrl} width={40} /> : <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-cci-100 font-bold text-cci-800">{speaker.label.charAt(0)}</span>}
          <span>{speaker.label}{speaker.description ? <span className="block text-sm font-normal text-slate-500">{speaker.description}</span> : null}</span>
        </Label>
        {isSelected ? <div className="mt-3 space-y-3">
          <Label className="flex items-center gap-2" htmlFor={`primary_${speaker.id}`}>
            <input defaultChecked={initialPrimary === speaker.id} id={`primary_${speaker.id}`} name="primary_instructor_id" type="radio" value={speaker.id} /> Principal
          </Label>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_90px]">
            <Input defaultValue={initial?.role_label ?? ""} name={`instructor_role_${speaker.id}`} placeholder="Rol docente" />
            <Input aria-label={`Orden de ${speaker.label}`} defaultValue={initial?.sort_order ?? selected.indexOf(speaker.id)} min="0" name={`instructor_order_${speaker.id}`} type="number" />
          </div>
        </div> : null}
      </div>;
    })}
  </div>;
}
