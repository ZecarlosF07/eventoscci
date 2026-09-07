import { HomeHeroCarousel } from "@/features/home/components/HomeHero/HomeHeroCarousel";
import type { HomeHeroProps } from "@/features/home/components/HomeHero/types/home-hero.types";
import { createHomeHeroSlides } from "@/features/home/utils/home-hero-slides";

export function HomeHero({ activities }: HomeHeroProps) {
  return <HomeHeroCarousel slides={createHomeHeroSlides(activities)} />;
}
