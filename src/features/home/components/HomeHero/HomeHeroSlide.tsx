import Link from "next/link";

import { HERO_PRIMARY_LINK } from "@/features/catalog/components/CatalogHeroCarousel/constants/hero-styles";
import { HomeHeroArtwork } from "@/features/home/components/HomeHero/HomeHeroArtwork";
import type { HomeHeroSlideProps } from "@/features/home/components/HomeHero/types/home-hero.types";

export function HomeHeroSlide({ active, featured, index }: HomeHeroSlideProps) {
  return (
    <article
      aria-hidden={!active}
      aria-label={featured?.title ?? "Eventos y formación CCI"}
      aria-roledescription="diapositiva"
      className={`col-start-1 row-start-1 min-w-0 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${active ? "z-10 translate-x-0 opacity-100" : "invisible pointer-events-none translate-x-6 opacity-0"}`}
      inert={!active}
    >
      <div className="grid h-full overflow-hidden lg:grid-cols-[1.1fr_1fr]">
        <HomeHeroArtwork bannerUrl={featured?.bannerUrl ?? null} eager={index === 0} title={featured?.title ?? "Eventos y formación CCI"} />
        <div className="relative flex min-w-0 flex-col justify-center p-6 pb-10 text-white sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.15em] lg:pr-20">
            <p className="flex items-center gap-2 text-cci-lime"><span aria-hidden="true" className="size-1.5 rounded-full bg-cci-lime" />{featured ? "En agenda" : "Tu espacio para crecer"}</p>
            {featured ? <span className="border-l border-white/20 pl-3 text-cci-sage">{featured.badge}</span> : null}
          </div>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.12] tracking-tight text-balance sm:text-4xl">
            {featured?.title ?? "Tu próximo paso empieza aquí."}
          </h2>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-cci-200 sm:text-base sm:leading-7">
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
              {featured ? "Ver detalles e inscripción" : "Explorar la agenda"}<span aria-hidden="true">↗</span>
            </Link>
            {featured ? <span className="text-xs font-medium text-cci-sage">{featured.priceLabel}</span> : null}
          </div>
        </div>
      </div>
    </article>
  );
}
