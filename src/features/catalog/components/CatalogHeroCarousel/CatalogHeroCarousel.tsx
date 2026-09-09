import { CatalogHeroSlide } from "@/features/catalog/components/CatalogHeroCarousel/CatalogHeroSlide";
import { CatalogHeroVisual } from "@/features/catalog/components/CatalogHeroCarousel/CatalogHeroVisual";
import { HERO_SECONDARY_LINK } from "@/features/catalog/components/CatalogHeroCarousel/constants/hero-styles";
import { HeroBackdrop } from "@/features/catalog/components/CatalogHeroCarousel/HeroBackdrop";
import type { CatalogHeroCarouselProps } from "@/features/catalog/components/CatalogHeroCarousel/types/catalog-hero-carousel.types";

export function CatalogHeroCarousel({
  browseLabel,
  description,
  emptyMessage,
  eyebrow,
  slides,
  title,
}: CatalogHeroCarouselProps) {
  const featured = slides[0];

  return (
    <section aria-label={`${title}: contenido destacado`} className="relative isolate overflow-hidden text-white">
      <HeroBackdrop />
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-5 sm:px-8 sm:pb-10 sm:pt-7">
        <header className="mb-5 flex items-end justify-between gap-8 border-l-4 border-cci-lime pl-4 sm:mb-6 sm:pl-5">
          <div className="shrink-0">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cci-lime">{eyebrow}</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">{title}</h1>
          </div>
          <p className="hidden max-w-2xl text-right text-sm leading-6 text-cci-200 md:block">{description}</p>
        </header>
        {featured ? (
          <CatalogHeroSlide browseLabel={browseLabel} slide={featured} />
        ) : (
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <div>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">Tu próxima oportunidad empieza aquí.</h2>
              <p className="mt-5 text-lg leading-7 text-cci-200">{emptyMessage}</p>
              <a className={`mt-7 ${HERO_SECONDARY_LINK}`} href="#catalogo">{browseLabel}<span aria-hidden="true">↓</span></a>
            </div>
            <CatalogHeroVisual bannerUrl={null} title={title} />
          </div>
        )}
      </div>
    </section>
  );
}
