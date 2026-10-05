"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { HomeContentCarouselProps } from "@/features/home/components/HomeContentCarousel/types/home-content-carousel.types";

export function HomeContentCarousel({
  ariaLabel,
  children,
  emptyState,
  header,
  tone = "light",
  viewAllHref,
  viewAllLabel,
}: HomeContentCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);
  const itemCount = Children.count(children);
  const isDark = tone === "dark";

  const updateControls = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    setCanScrollBack(viewport.scrollLeft > 4);
    setCanScrollForward(viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateControls();
    window.addEventListener("resize", updateControls);
    return () => window.removeEventListener("resize", updateControls);
  }, [itemCount, updateControls]);

  function scroll(direction: -1 | 1) {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.scrollBy({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", left: direction * viewport.clientWidth * 0.9 });
  }

  return (
    <div aria-label={ariaLabel} role="region">
      <div className="flex flex-wrap items-end justify-between gap-3">
        {header}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            className={isDark ? "inline-flex min-h-11 items-center rounded-xl bg-cci-lime px-4 text-sm font-bold text-cci-950 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-800 sm:min-h-11 sm:px-5" : "inline-flex min-h-11 items-center rounded-xl bg-cci-950 px-4 text-sm font-bold text-white transition hover:bg-cci-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-800 sm:min-h-11 sm:px-5"}
            href={viewAllHref}
          >
            {viewAllLabel}
          </Link>
          {itemCount > 1 ? (
            <div className="ml-auto flex items-center gap-2">
              <button
                aria-label={`Anterior en ${ariaLabel}`}
                className={isDark ? "flex size-11 items-center justify-center rounded-full border border-white/25 text-xl text-white transition hover:border-cci-lime hover:bg-cci-lime hover:text-cci-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-800 disabled:cursor-not-allowed disabled:opacity-35 sm:size-11" : "flex size-11 items-center justify-center rounded-full bg-cci-950 text-xl text-white transition hover:bg-cci-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-800 disabled:cursor-not-allowed disabled:opacity-35 sm:size-11"}
                disabled={!canScrollBack}
                onClick={() => scroll(-1)}
                type="button"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <button
                aria-label={`Siguiente en ${ariaLabel}`}
                className={isDark ? "flex size-11 items-center justify-center rounded-full border border-white/25 text-xl text-white transition hover:border-cci-lime hover:bg-cci-lime hover:text-cci-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-800 disabled:cursor-not-allowed disabled:opacity-35 sm:size-11" : "flex size-11 items-center justify-center rounded-full bg-cci-950 text-xl text-white transition hover:bg-cci-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-800 disabled:cursor-not-allowed disabled:opacity-35 sm:size-11"}
                disabled={!canScrollForward}
                onClick={() => scroll(1)}
                type="button"
              >
                <span aria-hidden="true">›</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {itemCount ? (
        <div
          className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 motion-reduce:scroll-auto outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-cci-lime sm:gap-5 [&::-webkit-scrollbar]:hidden"
          onScroll={updateControls}
          ref={viewportRef}
          tabIndex={0}
        >
          {Children.map(children, (child) => (
            <div className={itemCount === 1 ? "w-full shrink-0" : `w-[calc(100%_-_1.5rem)] max-w-[28rem] shrink-0 snap-start sm:w-[86vw] md:w-[calc((100%-1.25rem)/2)] md:max-w-none ${itemCount > 2 ? "xl:w-[calc((100%-2.5rem)/3)]" : ""}`}>
              {child}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">{emptyState}</div>
      )}
    </div>
  );
}
