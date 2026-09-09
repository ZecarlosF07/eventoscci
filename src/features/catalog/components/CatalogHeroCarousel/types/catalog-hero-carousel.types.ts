export interface CatalogCarouselSlide {
  artworkVariant?: "commercial";
  badge: string;
  ctaLabel: string;
  kindLabel: string;
  priceLabel: string;
  bannerUrl: string | null;
  description: string | null;
  href: string;
  id: string;
  meta: string | null;
  title: string;
  visualMode: "banner" | "feature";
}

export interface CatalogHeroCarouselProps {
  browseLabel: string;
  description: string;
  emptyMessage: string;
  eyebrow: string;
  slides: CatalogCarouselSlide[];
  title: string;
}
