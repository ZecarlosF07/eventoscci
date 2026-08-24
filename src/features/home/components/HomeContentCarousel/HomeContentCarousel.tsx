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

    viewport.scrollBy({ behavior: "smooth", left: direction * viewport.clientWidth * 0.9 });
  }

  return (
    <div aria-label={ariaLabel} role="region">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        {header}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            className={isDark ? "inline-flex min-h-11 items-center rounded-xl bg-cci-lime px-5 text-sm font-bold text-cci-950 transition hover:bg-white" : "inline-flex min-h-11 items-center rounded-xl bg-cci-950 px-5 text-sm font-bold text-white transition hover:bg-cci-800"}
            href={viewAllHref}
          >
            {viewAllLabel}
          </Link>
          {itemCount ? (
            <>
              <button
                aria-label={`Anterior en ${ariaLabel}`}
                className={isDark ? "flex size-11 items-center justify-center rounded-full border border-white/25 text-xl text-white transition hover:border-cci-lime hover:bg-cci-lime hover:text-cci-950 disabled:cursor-not-allowed disabled:opacity-35" : "flex size-11 items-center justify-center rounded-full bg-cci-950 text-xl text-white transition hover:bg-cci-800 disabled:cursor-not-allowed disabled:opacity-35"}
                disabled={!canScrollBack}
                onClick={() => scroll(-1)}
                type="button"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <button
                aria-label={`Siguiente en ${ariaLabel}`}
                className={isDark ? "flex size-11 items-center justify-center rounded-full border border-white/25 text-xl text-white transition hover:border-cci-lime hover:bg-cci-lime hover:text-cci-950 disabled:cursor-not-allowed disabled:opacity-35" : "flex size-11 items-center justify-center rounded-full bg-cci-950 text-xl text-white transition hover:bg-cci-800 disabled:cursor-not-allowed disabled:opacity-35"}
                disabled={!canScrollForward}
                onClick={() => scroll(1)}
                type="button"
              >
                <span aria-hidden="true">›</span>
              </button>
            </>
          ) : null}
        </div>
      </div>

      {itemCount ? (
        <div
          className="mt-7 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-cci-lime [&::-webkit-scrollbar]:hidden"
          onScroll={updateControls}
          ref={viewportRef}
          tabIndex={0}
        >
          {Children.map(children, (child) => (
            <div className="w-[86vw] max-w-[28rem] shrink-0 snap-start md:w-[calc((100%-1.25rem)/2)] md:max-w-none xl:w-[calc((100%-2.5rem)/3)]">
              {child}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-7">{emptyState}</div>
      )}
    </div>
  );
}
