"use client";

import { useState, type FocusEvent } from "react";

import { HeroBackdrop } from "@/features/catalog/components/CatalogHeroCarousel/HeroBackdrop";
import { useCatalogCarousel } from "@/features/catalog/components/CatalogHeroCarousel/hooks/use-catalog-carousel";
import { HomeHeroSlide } from "@/features/home/components/HomeHero/HomeHeroSlide";
import type { HomeHeroCarouselProps } from "@/features/home/components/HomeHero/types/home-hero.types";

export function HomeHeroCarousel({ label = "Actividades destacadas", slides }: HomeHeroCarouselProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const carousel = useCatalogCarousel(slides.length, hovered || focused);
  const currentIndex = slides.length ? carousel.currentIndex % slides.length : 0;

  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  }

  return (
    <section
      aria-label={label}
      aria-roledescription="carrusel"
      className="relative isolate w-full overflow-hidden bg-cci-950"
      onBlur={handleBlur}
      onFocus={() => setFocused(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <HeroBackdrop />
      {slides.length > 1 ? (
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-0.5 rounded-full border border-white/20 bg-cci-950/85 p-1 text-white shadow-lg backdrop-blur-sm sm:bottom-6 sm:right-8 sm:gap-1">
          <button
            aria-label="Mostrar actividad anterior"
            className="flex size-8 items-center justify-center rounded-full text-lg transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime sm:size-9"
            onClick={carousel.previous}
            type="button"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            aria-label="Mostrar siguiente actividad"
            className="flex size-8 items-center justify-center rounded-full text-lg transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime sm:size-9"
            onClick={carousel.next}
            type="button"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      ) : null}
      <div aria-live={carousel.isAutoPlaying ? "off" : "polite"} className="grid">
        {slides.length ? slides.map((slide, index) => (
          <HomeHeroSlide active={index === currentIndex} featured={slide} index={index} key={slide.id} />
        )) : <HomeHeroSlide active featured={null} index={0} />}
      </div>
    </section>
  );
}
