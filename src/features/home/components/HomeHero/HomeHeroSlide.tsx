import Link from "next/link";

import { HERO_PRIMARY_LINK } from "@/features/catalog/components/CatalogHeroCarousel/constants/hero-styles";
import { HomeHeroArtwork } from "@/features/home/components/HomeHero/HomeHeroArtwork";
import type { HomeHeroSlideProps } from "@/features/home/components/HomeHero/types/home-hero.types";

export function HomeHeroSlide({ active, featured, index }: HomeHeroSlideProps) {
  const stateClassName = active
    ? "z-10 translate-x-0 opacity-100"
    : "invisible pointer-events-none translate-x-6 opacity-0";

  if (featured?.bannerUrl) {
    return (
      <article
        aria-hidden={!active}
        aria-label={featured.title}
        aria-roledescription="diapositiva"
        className={`col-start-1 row-start-1 min-w-0 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${stateClassName}`}
        inert={!active}
      >
        <Link
          aria-label={`Ver detalles e inscripción de ${featured.title}`}
          className="block w-full border-y border-white/20 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-cci-lime"
          href={featured.href}
        >
          <HomeHeroArtwork bannerUrl={featured.bannerUrl} eager={index === 0} title={featured.title} wide />
        </Link>
      </article>
    );
  }

  return (
    <article
      aria-hidden={!active}
      aria-label={featured?.title ?? "Eventos y formación CCI"}
      aria-roledescription="diapositiva"
      className={`col-start-1 row-start-1 min-w-0 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${stateClassName}`}
      inert={!active}
    >
      <div className="relative isolate min-h-[21rem] overflow-hidden bg-linear-to-r from-cci-800 via-cci-900 to-cci-950">
          <span aria-hidden="true" className="absolute -right-32 -top-60 -z-10 size-[34rem] rounded-full border border-cci-lime/20" />
          <span aria-hidden="true" className="absolute -right-12 -top-44 -z-10 size-[27rem] rounded-full border border-cci-lime/15" />
          <span aria-hidden="true" className="absolute -bottom-36 right-32 -z-10 size-80 rounded-full bg-cci-lime/10 blur-3xl" />
          <span aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 w-1/3 bg-linear-to-l from-cci-lime/5 to-transparent" />
        <div className="relative mx-auto flex min-h-[21rem] w-full max-w-[90rem] min-w-0 flex-col justify-center px-5 pb-11 pt-9 text-white sm:px-8 sm:pb-12 sm:pt-10 lg:px-12 lg:pr-72">
          <div className="flex flex-wrap items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.15em] lg:pr-20">
            <p className="flex items-center gap-2 text-cci-lime"><span aria-hidden="true" className="size-1.5 rounded-full bg-cci-lime" />{featured?.kindLabel ?? "Tu espacio para crecer"}</p>
            {featured ? <span className="border-l border-white/20 pl-3 text-cci-sage">{featured.badge}</span> : null}
          </div>
          <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {featured?.title ?? "Tu próximo paso empieza aquí."}
          </h2>
          <p className="mt-4 max-w-3xl line-clamp-3 text-sm leading-6 text-cci-200 sm:text-base sm:leading-7">
            {featured?.description || "Conecta con profesionales, comparte ideas y descubre nuevas oportunidades con la Cámara de Comercio de Ica."}
          </p>
          {featured?.meta ? (
            <p className="mt-5 flex items-start gap-2.5 text-sm leading-6 text-cci-100">
              <svg aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-cci-sage" fill="none" viewBox="0 0 24 24">
                <path d="M8 3v4m8-4v4M4 10h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
              </svg>
              <span>{featured.meta}</span>
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/10 pt-5">
            <Link className={`${HERO_PRIMARY_LINK} w-full sm:w-auto`} href={featured?.href ?? "/eventos"}>
              {featured?.ctaLabel ?? "Explorar la agenda"}<span aria-hidden="true">↗</span>
            </Link>
            {featured?.priceLabel ? <span className="text-xs font-medium text-cci-sage">{featured.priceLabel}</span> : null}
          </div>
        </div>
      </div>
    </article>
  );
}
