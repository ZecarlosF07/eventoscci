import Image from "next/image";
import Link from "next/link";

import type { VisualContentCardProps } from "@/components/molecules/VisualContentCard/types/visual-content-card.types";

const ANIMATION_DELAYS = ["motion-safe:[animation-delay:0ms]", "motion-safe:[animation-delay:90ms]", "motion-safe:[animation-delay:180ms]"] as const;

export function VisualContentCard({
  animationOrder = 0,
  bannerUrl,
  href,
  meta,
  summary,
  title,
}: VisualContentCardProps) {
  const animationDelay = ANIMATION_DELAYS[animationOrder] ?? ANIMATION_DELAYS[2];

  return (
    <article className={`group motion-safe:animate-[home-card-reveal_600ms_cubic-bezier(0.22,1,0.36,1)_both] ${animationDelay}`}>
      <Link
        aria-label={`Ver ${title}`}
        className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-cci-950 shadow-lg shadow-cci-950/15 outline-none ring-1 ring-cci-950/5 transition duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-cci-950/25 hover:ring-cci-lime/60 focus-visible:ring-4 focus-visible:ring-cci-lime focus-visible:ring-offset-4 sm:aspect-video sm:rounded-3xl motion-reduce:transform-none motion-reduce:transition-none"
        href={href}
      >
        {bannerUrl ? (
          <Image
            alt=""
            className="object-cover transition duration-700 ease-out group-hover:scale-105"
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            src={bannerUrl}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-cci-950 px-8 pb-16 pt-8 text-white">
            <span className="absolute -right-14 -top-20 size-56 rounded-full border border-cci-lime/45 transition duration-700 group-hover:scale-110" />
            <span className="absolute -right-5 -top-12 size-44 rounded-full border border-cci-lime/25 transition duration-700 group-hover:scale-110" />
            <span className="absolute -bottom-24 -left-16 size-64 rounded-full border border-cci-sage/25" />
            <p className="relative line-clamp-3 max-w-[90%] text-center font-display text-2xl leading-tight sm:text-3xl">
              {title}
            </p>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-cci-950 via-cci-950/25 to-transparent transition duration-300 group-hover:from-cci-950 group-hover:via-cci-950/35" />
        <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[650%] group-focus-within:translate-x-[650%] motion-reduce:hidden" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-5 text-white sm:p-6">
          <div className="min-w-0">
            {bannerUrl ? <h3 className="line-clamp-2 text-xl font-semibold leading-tight sm:text-2xl">{title}</h3> : null}
            {meta ? <p className={`${bannerUrl ? "mt-2" : ""} line-clamp-1 text-sm font-medium text-white/75`}>{meta}</p> : null}
          </div>
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-lg text-white ring-1 ring-white/20 transition duration-300 group-hover:translate-x-1 group-hover:bg-cci-lime group-hover:text-cci-950 group-hover:ring-cci-lime group-focus-within:translate-x-1 group-focus-within:bg-cci-lime group-focus-within:text-cci-950"
          >
            →
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-cci-950/96 p-5 text-white backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-focus-within:translate-y-0 motion-reduce:transition-none sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="line-clamp-2 text-xl font-semibold leading-tight">{title}</h3>
            <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cci-lime text-cci-950">→</span>
          </div>
          {summary ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/75">{summary}</p> : null}
          {meta ? <p className="mt-3 border-t border-white/15 pt-3 text-sm font-semibold text-cci-lime">{meta}</p> : null}
        </div>
      </Link>
    </article>
  );
}
