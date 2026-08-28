"use client";

import { useCallback, useEffect, useState } from "react";

import type { UseCatalogCarouselResult } from "@/features/catalog/components/CatalogHeroCarousel/hooks/types/use-catalog-carousel.types";

const AUTOPLAY_DELAY_MS = 6500;

export function useCatalogCarousel(itemCount: number, interactionPaused: boolean): UseCatalogCarouselResult {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const select = useCallback((index: number) => {
    if (!itemCount) return;
    setCurrentIndex((index + itemCount) % itemCount);
  }, [itemCount]);

  const next = useCallback(() => select(currentIndex + 1), [currentIndex, select]);
  const previous = useCallback(() => select(currentIndex - 1), [currentIndex, select]);

  useEffect(() => {
    if (itemCount < 2 || interactionPaused || !isAutoPlaying) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timeoutId = window.setTimeout(() => {
      setCurrentIndex((index) => (index + 1) % itemCount);
    }, AUTOPLAY_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, [currentIndex, interactionPaused, isAutoPlaying, itemCount]);

  return {
    currentIndex,
    isAutoPlaying,
    next,
    pause: () => setIsAutoPlaying(false),
    play: () => setIsAutoPlaying(true),
    previous,
    select,
  };
}
