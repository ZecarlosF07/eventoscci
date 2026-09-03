import { CatalogHeroSlide } from "@/features/catalog/components/CatalogHeroCarousel/CatalogHeroSlide";
import { CatalogHeroVisual } from "@/features/catalog/components/CatalogHeroCarousel/CatalogHeroVisual";
import { HERO_SECONDARY_LINK } from "@/features/catalog/components/CatalogHeroCarousel/constants/hero-styles";
import { HeroBackdrop } from "@/features/catalog/components/CatalogHeroCarousel/HeroBackdrop";
import type { CatalogHeroCarouselProps } from "@/features/catalog/components/CatalogHeroCarousel/types/catalog-hero-carousel.types";

export function CatalogHeroCarousel({
  browseLabel,
  emptyMessage,
  slides,
  title,
}: CatalogHeroCarouselProps) {
  const featured = slides[0];

  return (
    <section aria-label={`${title}: contenido destacado`} className="relative isolate overflow-hidden text-white">
      <HeroBackdrop />
      <h1 className="sr-only">{title}</h1>
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-7 sm:px-8 sm:pb-12 sm:pt-9">
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
