import { CatalogHeroHeader } from "@/features/catalog/components/CatalogHeroCarousel/CatalogHeroHeader";
import type { CatalogHeroCarouselProps } from "@/features/catalog/components/CatalogHeroCarousel/types/catalog-hero-carousel.types";
import { createCatalogFallbackSlide } from "@/features/catalog/utils/catalog-hero";
import { HomeHeroCarousel } from "@/features/home/components/HomeHero/HomeHeroCarousel";

export function CatalogHeroCarousel({
  browseLabel,
  description,
  emptyMessage,
  eyebrow,
  slides,
  title,
}: CatalogHeroCarouselProps) {
  const carouselSlides = slides.length
    ? slides
    : [
        createCatalogFallbackSlide({
          browseLabel,
          description: emptyMessage,
          eyebrow,
          title,
        }),
      ];

  return (
    <section aria-label={`${title}: contenido destacado`} className="overflow-hidden bg-white">
      <CatalogHeroHeader description={description} eyebrow={eyebrow} title={title} />
      <HomeHeroCarousel label={`${title}: contenido destacado`} slides={carouselSlides} />
    </section>
  );
}
