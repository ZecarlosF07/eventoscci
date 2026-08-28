"use client";

import Image from "next/image";
import { useState } from "react";

import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import type { ActivityProgramImageFieldsProps } from "@/features/activities/components/ActivityProgramImageFields/types/activity-program-image-fields.types";
import { getActivityImageUrl } from "@/features/activities/utils/activity-formatters";

export function ActivityProgramImageFields({
  error,
  initialPaths,
}: ActivityProgramImageFieldsProps) {
  const [paths, setPaths] = useState(initialPaths);

  return (
    <div className="space-y-4 rounded-2xl border border-cci-100 bg-cci-50 p-4 sm:p-5">
      <div>
        <h3 className="font-semibold text-cci-950">Programa visual</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">Sube hasta 10 páginas verticales JPG, PNG o WebP. Se mostrarán en el mismo orden en que las selecciones.</p>
      </div>
      {paths.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {paths.map((path, index) => {
            const imageUrl = getActivityImageUrl(path);
            return (
              <div className="relative overflow-hidden rounded-xl bg-white ring-1 ring-cci-200" key={path}>
                {imageUrl ? <Image alt={`Página ${index + 1} del programa`} className="aspect-[3/4] w-full bg-cci-50 object-contain" height={240} src={imageUrl} width={180} /> : null}
                <input name="program_image_paths" type="hidden" value={path} />
                <button className="absolute right-2 top-2 min-h-9 rounded-lg bg-cci-950/90 px-3 text-xs font-semibold text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime" onClick={() => setPaths((current) => current.filter((item) => item !== path))} type="button">Quitar</button>
              </div>
            );
          })}
        </div>
      ) : null}
      <FormField error={error} hint="Puedes elegir todas las páginas a la vez. Las nuevas imágenes se añadirán después de las actuales." label="Imágenes del programa" name="program_images">
        <Input accept="image/jpeg,image/png,image/webp" id="program_images" multiple name="program_images" type="file" />
      </FormField>
    </div>
  );
}
