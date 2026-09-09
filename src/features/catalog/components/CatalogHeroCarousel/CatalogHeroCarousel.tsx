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
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-7 sm:px-8 sm:pb-12 sm:pt-9">
        <header className="mb-7 max-w-3xl sm:mb-9">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-lime">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h1>
          <p className="mt-3 text-base leading-7 text-cci-200">{description}</p>
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
