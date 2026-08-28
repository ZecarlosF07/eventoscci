import type { CatalogCarouselSlide } from "@/features/catalog/components/CatalogHeroCarousel/types/catalog-hero-carousel.types";

export interface CatalogHeroSlideProps {
  active: boolean;
  index: number;
  label: string;
  slide: CatalogCarouselSlide;
}
