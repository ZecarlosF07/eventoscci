"use client";

import { useState, type FocusEvent } from "react";

import { HeroBackdrop } from "@/features/catalog/components/CatalogHeroCarousel/HeroBackdrop";
import { useCatalogCarousel } from "@/features/catalog/components/CatalogHeroCarousel/hooks/use-catalog-carousel";
import { HomeHeroSlide } from "@/features/home/components/HomeHero/HomeHeroSlide";
import type { HomeHeroCarouselProps } from "@/features/home/components/HomeHero/types/home-hero.types";

export function HomeHeroCarousel({ slides }: HomeHeroCarouselProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const carousel = useCatalogCarousel(slides.length, hovered || focused);
  const currentIndex = slides.length ? carousel.currentIndex % slides.length : 0;

  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  }

  return (
    <section
      aria-label="Actividades destacadas"
      aria-roledescription="carrusel"
      className="relative isolate w-full overflow-hidden bg-cci-950 pb-7"
      onBlur={handleBlur}
      onFocus={() => setFocused(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <HeroBackdrop />
      <h1 className="sr-only">Eventos, capacitaciones y formación CCI</h1>
      {slides.length > 1 ? (
        <div className="absolute right-4 top-4 z-20 flex gap-1 rounded-full border border-white/25 bg-cci-950/80 p-1 text-white backdrop-blur-sm">
        <button
          aria-label={carousel.isAutoPlaying ? "Pausar actividades destacadas" : "Reanudar actividades destacadas"}
          className="flex size-10 items-center justify-center rounded-full text-sm transition hover:bg-cci-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime"
          onClick={carousel.isAutoPlaying ? carousel.pause : carousel.play}
          type="button"
        >
          <span aria-hidden="true">{carousel.isAutoPlaying ? "Ⅱ" : "▶"}</span>
        </button>
        <button
          aria-label="Mostrar siguiente actividad"
          className="flex size-10 items-center justify-center rounded-full text-xl transition hover:bg-cci-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime"
          onClick={() => { carousel.pause(); carousel.next(); }}
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
