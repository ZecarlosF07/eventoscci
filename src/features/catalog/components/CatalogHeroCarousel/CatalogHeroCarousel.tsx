"use client";

import { useState, type FocusEvent, type KeyboardEvent } from "react";

import { CatalogCarouselControls } from "@/features/catalog/components/CatalogHeroCarousel/CatalogCarouselControls";
import { CatalogHeroFallback } from "@/features/catalog/components/CatalogHeroCarousel/CatalogHeroFallback";
import { CatalogHeroSlide } from "@/features/catalog/components/CatalogHeroCarousel/CatalogHeroSlide";
import { useCatalogCarousel } from "@/features/catalog/components/CatalogHeroCarousel/hooks/use-catalog-carousel";
import type { CatalogHeroCarouselProps } from "@/features/catalog/components/CatalogHeroCarousel/types/catalog-hero-carousel.types";

export function CatalogHeroCarousel({
  description,
  emptyMessage,
  eyebrow,
  slides,
  title,
}: CatalogHeroCarouselProps) {
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const carousel = useCatalogCarousel(slides.length, hovered || focusWithin);

  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") carousel.previous();
    if (event.key === "ArrowRight") carousel.next();
  }

  return (
    <section
      aria-label={`${title}: contenido destacado`}
      className="relative isolate overflow-hidden bg-cci-950 text-white"
      onBlur={handleBlur}
      onFocus={() => setFocusWithin(true)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <h1 className="sr-only">{title}</h1>
      <div aria-live="off" className="relative h-[39rem] sm:h-[44rem] lg:h-[34rem]">
        {slides.map((slide, index) => <CatalogHeroSlide active={carousel.currentIndex === index} index={index} key={slide.id} label={`${eyebrow} · ${title}`} slide={slide} />)}
        {!slides.length ? (
          <div className="mx-auto grid h-full max-w-[90rem] grid-rows-[13.5rem_1fr] sm:grid-rows-[20rem_1fr] lg:grid-cols-[0.92fr_1.08fr] lg:grid-rows-none">
            <div className="order-2 flex flex-col justify-center px-4 py-7 sm:px-6 sm:py-9 lg:order-1 lg:px-12"><p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-lime sm:text-sm sm:tracking-[0.2em]">{eyebrow}</p><h2 className="mt-3 text-3xl font-semibold sm:text-5xl">{title}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:mt-4 sm:text-lg sm:leading-7">{description}</p><p className="mt-5 font-semibold text-cci-lime sm:mt-7">{emptyMessage}</p></div>
            <div className="relative order-1 min-h-0 lg:order-2 lg:min-h-full"><CatalogHeroFallback /></div>
          </div>
        ) : null}
      </div>
      <CatalogCarouselControls
        currentIndex={carousel.currentIndex}
        isAutoPlaying={carousel.isAutoPlaying}
        itemCount={slides.length}
        onNext={carousel.next}
        onPause={carousel.pause}
        onPlay={carousel.play}
        onPrevious={carousel.previous}
        onSelect={carousel.select}
      />
    </section>
  );
}
