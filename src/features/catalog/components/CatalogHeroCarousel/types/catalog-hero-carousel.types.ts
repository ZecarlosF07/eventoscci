export interface CatalogCarouselSlide {
  badge: string;
  bannerUrl: string | null;
  description: string | null;
  href: string;
  id: string;
  meta: string | null;
  title: string;
}

export interface CatalogHeroCarouselProps {
  description: string;
  emptyMessage: string;
  eyebrow: string;
  slides: CatalogCarouselSlide[];
  title: string;
}
