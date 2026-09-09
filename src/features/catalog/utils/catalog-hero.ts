import type { CatalogCarouselSlide } from "@/features/catalog/components/CatalogHeroCarousel/types/catalog-hero-carousel.types";
import type { CreateCatalogFallbackSlideInput } from "@/features/catalog/components/CatalogHeroCarousel/types/catalog-hero-fallback.types";

export function createCatalogFallbackSlide({
  browseLabel,
  description,
  eyebrow,
  title,
}: CreateCatalogFallbackSlideInput): CatalogCarouselSlide {
  return {
    artworkVariant: "commercial",
    badge: title,
    bannerUrl: null,
    ctaLabel: browseLabel,
    description,
    href: "#catalogo",
    id: `catalog-fallback-${title.toLocaleLowerCase("es-PE").replaceAll(" ", "-")}`,
    kindLabel: eyebrow,
    meta: null,
    priceLabel: "",
    title,
    visualMode: "banner",
  };
}
