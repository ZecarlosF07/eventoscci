import Link from "next/link";

import { CatalogHeroVisual } from "@/features/catalog/components/CatalogHeroCarousel/CatalogHeroVisual";
import { HERO_PRIMARY_LINK, HERO_SECONDARY_LINK } from "@/features/catalog/components/CatalogHeroCarousel/constants/hero-styles";
import type { CatalogHeroSlideProps } from "@/features/catalog/components/CatalogHeroCarousel/types/catalog-hero-slide.types";

export function CatalogHeroSlide({ browseLabel, slide }: CatalogHeroSlideProps) {
  return (
    <article
      aria-label={slide.title}
      className="grid min-w-0 items-center gap-7 lg:grid-cols-[1fr_1.05fr] lg:gap-14"
    >
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cci-lime">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-cci-lime" />{slide.kindLabel}
        </p>
        <h2 className="mt-4 max-w-2xl break-words text-3xl font-semibold leading-[1.12] tracking-tight text-balance sm:text-4xl xl:text-5xl">{slide.title}</h2>
        {slide.description ? <p className="mt-4 line-clamp-3 max-w-xl text-base leading-7 text-cci-200">{slide.description}</p> : null}
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-cci-100">{slide.badge}</span>
          <span className="rounded-md bg-cci-lime/10 px-2.5 py-1.5 text-cci-lime">{slide.priceLabel}</span>
        </div>
        {slide.meta ? <p className="mt-4 text-sm font-medium leading-6 text-cci-100">{slide.meta}</p> : null}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link className={HERO_PRIMARY_LINK} href={slide.href}>{slide.ctaLabel}<span aria-hidden="true">↗</span></Link>
          <a className={HERO_SECONDARY_LINK} href="#catalogo">{browseLabel}<span aria-hidden="true">↓</span></a>
        </div>
      </div>
      <CatalogHeroVisual bannerUrl={slide.bannerUrl} eager title={slide.title} />
    </article>
  );
}
