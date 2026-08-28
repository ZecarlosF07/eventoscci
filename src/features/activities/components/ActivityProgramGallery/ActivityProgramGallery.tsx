"use client";

import Image from "next/image";
import { useState } from "react";

import { Heading } from "@/components/atoms/Heading";
import type { ActivityProgramGalleryProps } from "@/features/activities/components/ActivityProgramGallery/types/activity-program-gallery.types";
import { getActivityImageUrl } from "@/features/activities/utils/activity-formatters";

export function ActivityProgramGallery({
  activityTitle,
  imagePaths,
}: ActivityProgramGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeUrl = getActivityImageUrl(imagePaths[activeIndex] ?? null);
  if (!activeUrl) return null;

  const hasMultiplePages = imagePaths.length > 1;
  const showPrevious = () => setActiveIndex((current) => Math.max(0, current - 1));
  const showNext = () => setActiveIndex((current) => Math.min(imagePaths.length - 1, current + 1));

  return (
    <section className="overflow-hidden rounded-3xl bg-cci-950 p-4 text-white shadow-xl shadow-cci-950/10 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cci-lime">Contenido de la actividad</p>
          <Heading className="mt-2 text-white" level={2}>Programa</Heading>
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-white/65">{activeIndex + 1} de {imagePaths.length}</span>
          {hasMultiplePages ? <button aria-label="Página anterior del programa" className="flex size-11 items-center justify-center rounded-full border border-white/15 text-xl transition hover:border-cci-lime hover:bg-cci-lime hover:text-cci-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime disabled:cursor-not-allowed disabled:opacity-35" disabled={activeIndex === 0} onClick={showPrevious} type="button">←</button> : null}
          {hasMultiplePages ? <button aria-label="Página siguiente del programa" className="flex size-11 items-center justify-center rounded-full border border-white/15 text-xl transition hover:border-cci-lime hover:bg-cci-lime hover:text-cci-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime disabled:cursor-not-allowed disabled:opacity-35" disabled={activeIndex === imagePaths.length - 1} onClick={showNext} type="button">→</button> : null}
        </div>
      </div>

      <div className="relative mx-auto mt-5 aspect-[3/4] w-full max-w-xl overflow-hidden rounded-2xl bg-white">
        <Image alt={`Programa de ${activityTitle}, página ${activeIndex + 1}`} className="object-contain" fill preload={activeIndex === 0} sizes="(min-width: 1024px) 576px, 100vw" src={activeUrl} />
        <a className="absolute bottom-3 right-3 inline-flex min-h-10 items-center rounded-xl bg-cci-950/90 px-3 text-xs font-semibold text-white backdrop-blur transition hover:bg-cci-lime hover:text-cci-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime" href={activeUrl} rel="noreferrer" target="_blank">Ver en tamaño completo ↗</a>
      </div>

      {hasMultiplePages ? (
        <div aria-label="Páginas del programa" className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {imagePaths.map((path, index) => {
            const imageUrl = getActivityImageUrl(path);
            if (!imageUrl) return null;
            return (
              <button aria-current={index === activeIndex ? "page" : undefined} aria-label={`Mostrar página ${index + 1}`} className={`relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-xl bg-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime sm:w-20 ${index === activeIndex ? "ring-3 ring-cci-lime" : "opacity-55 ring-1 ring-white/20 hover:opacity-100"}`} key={path} onClick={() => setActiveIndex(index)} type="button">
                <Image alt="" className="object-cover" fill sizes="80px" src={imageUrl} />
                <span className="absolute bottom-1 right-1 flex size-5 items-center justify-center rounded-full bg-cci-950 text-[0.65rem] font-bold text-white">{index + 1}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
