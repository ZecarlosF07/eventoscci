import Image from "next/image";

import { CatalogHeroFallback } from "@/features/catalog/components/CatalogHeroCarousel/CatalogHeroFallback";
import type { HomeHeroArtworkProps } from "@/features/home/components/HomeHero/types/home-hero.types";

export function HomeHeroArtwork({ bannerUrl, eager = false, title }: HomeHeroArtworkProps) {
  return (
    <div className="relative isolate aspect-video min-w-0 overflow-hidden bg-cci-900 text-white lg:aspect-auto lg:min-h-96">
      {bannerUrl ? (
        <Image
          alt={`Portada de ${title}`}
          className="object-contain"
          fill
          loading={eager ? "eager" : "lazy"}
          sizes="(min-width: 1024px) 53vw, 100vw"
          src={bannerUrl}
        />
      ) : <CatalogHeroFallback />}
    </div>
  );
}
