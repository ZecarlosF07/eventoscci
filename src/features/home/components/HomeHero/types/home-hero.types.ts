import type { ActivityListItem } from "@/features/activities/types/activity.types";
import type { CatalogCarouselSlide } from "@/features/catalog/components/CatalogHeroCarousel/types/catalog-hero-carousel.types";

export interface HomeHeroProps {
  activities: ActivityListItem[];
}

export interface HomeHeroArtworkProps {
  bannerUrl: string | null;
  description?: string | null;
  eager?: boolean;
  title: string;
  variant?: "commercial";
  wide?: boolean;
}

export interface HomeHeroCarouselProps {
  label?: string;
  slides: CatalogCarouselSlide[];
}

export interface HomeHeroSlideProps {
  active: boolean;
  featured: CatalogCarouselSlide | null;
  index: number;
}
