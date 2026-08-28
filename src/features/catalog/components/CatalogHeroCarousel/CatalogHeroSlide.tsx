import Image from "next/image";
import Link from "next/link";

import { CatalogHeroFallback } from "@/features/catalog/components/CatalogHeroCarousel/CatalogHeroFallback";
import type { CatalogHeroSlideProps } from "@/features/catalog/components/CatalogHeroCarousel/types/catalog-hero-slide.types";

export function CatalogHeroSlide({ active, index, label, slide }: CatalogHeroSlideProps) {
  return (
    <Link
      aria-hidden={!active}
      className={`absolute inset-0 outline-none transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-cci-lime motion-reduce:transition-none ${active ? "z-10 opacity-100" : "pointer-events-none opacity-0"}`}
      href={slide.href}
      tabIndex={active ? 0 : -1}
    >
      <div className="mx-auto grid h-full max-w-[90rem] grid-rows-[13.5rem_1fr] sm:grid-rows-[20rem_1fr] lg:grid-cols-[0.92fr_1.08fr] lg:grid-rows-none">
        <div className="order-2 flex flex-col justify-center bg-cci-950 px-4 py-7 sm:px-6 sm:py-9 lg:order-1 lg:px-12 lg:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-lime sm:text-sm sm:tracking-[0.2em]">{label}</p>
          <h2 className="mt-3 line-clamp-3 max-w-2xl break-words text-3xl font-semibold leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">{slide.title}</h2>
          {slide.description ? <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-6 text-white/72 sm:mt-4 sm:text-lg sm:leading-7">{slide.description}</p> : null}
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/15">{slide.badge}</span>
            {slide.meta ? <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/15">{slide.meta}</span> : null}
          </div>
          <span className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-cci-lime px-5 text-sm font-bold text-cci-950 transition hover:bg-white sm:mt-7 sm:min-h-12">
            Ver detalles <span aria-hidden="true">→</span>
          </span>
        </div>

        <div className="relative order-1 min-h-0 overflow-hidden bg-cci-900 lg:order-2 lg:min-h-full">
          {slide.bannerUrl ? (
            <>
              <Image
                alt=""
                className={`object-cover transition duration-[6500ms] ease-linear motion-reduce:transition-none ${active ? "scale-105" : "scale-100"}`}
                fill
                loading={index === 0 ? "eager" : "lazy"}
                sizes="(min-width: 1024px) 55vw, 100vw"
                src={slide.bannerUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cci-950/75 via-transparent to-transparent lg:bg-gradient-to-r lg:from-cci-950/20 lg:via-transparent" />
            </>
          ) : <CatalogHeroFallback />}
        </div>
      </div>
    </Link>
  );
}
