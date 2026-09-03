"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import type { UseCatalogCarouselResult } from "@/features/catalog/components/CatalogHeroCarousel/hooks/types/use-catalog-carousel.types";

const AUTOPLAY_DELAY_MS = 6500;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(listener: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

function getReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerReducedMotion() {
  return false;
}

export function useCatalogCarousel(itemCount: number, interactionPaused: boolean): UseCatalogCarouselResult {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackChoice, setPlaybackChoice] = useState<boolean | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);
  const isAutoPlaying = playbackChoice ?? !reducedMotion;

  const select = useCallback((index: number) => {
    if (!itemCount) return;
    setCurrentIndex((index + itemCount) % itemCount);
  }, [itemCount]);

  const next = useCallback(() => select(currentIndex + 1), [currentIndex, select]);
  const previous = useCallback(() => select(currentIndex - 1), [currentIndex, select]);

  useEffect(() => {
    if (itemCount < 2 || interactionPaused || !isAutoPlaying) return;
    let timeoutId: number | undefined;
    function scheduleNext() {
      window.clearTimeout(timeoutId);
      if (document.hidden) return;
      timeoutId = window.setTimeout(() => {
        setCurrentIndex((index) => (index + 1) % itemCount);
      }, AUTOPLAY_DELAY_MS);
    }
    scheduleNext();
    document.addEventListener("visibilitychange", scheduleNext);
    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", scheduleNext);
    };
  }, [currentIndex, interactionPaused, isAutoPlaying, itemCount]);

  return {
    currentIndex,
    isAutoPlaying,
    next,
    pause: () => setPlaybackChoice(false),
    play: () => setPlaybackChoice(true),
    previous,
    select,
  };
}
