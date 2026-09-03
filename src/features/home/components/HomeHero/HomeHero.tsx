import { createActivityCarouselSlides } from "@/features/catalog/utils/catalog-carousel";
import { HomeHeroCarousel } from "@/features/home/components/HomeHero/HomeHeroCarousel";
import type { HomeHeroProps } from "@/features/home/components/HomeHero/types/home-hero.types";

export function HomeHero({ activities }: HomeHeroProps) {
  return <HomeHeroCarousel slides={createActivityCarouselSlides(activities)} />;
}
