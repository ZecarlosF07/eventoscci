import Image from "next/image";

import { CatalogHeroFallback } from "@/features/catalog/components/CatalogHeroCarousel/CatalogHeroFallback";
import type { CatalogHeroVisualProps } from "@/features/catalog/components/CatalogHeroCarousel/types/catalog-hero-visual.types";

export function CatalogHeroVisual({ bannerUrl, eager = false, title }: CatalogHeroVisualProps) {
  return (
    <div className="relative isolate aspect-[16/10] overflow-hidden rounded-2xl border border-white/15 bg-cci-950 shadow-2xl shadow-black/20 sm:rounded-3xl">
      {bannerUrl ? (
        <Image
          alt={`Portada de ${title}`}
          className="object-contain"
          fill
          loading={eager ? "eager" : "lazy"}
          sizes="(min-width: 1280px) 580px, (min-width: 1024px) 46vw, (min-width: 640px) 80vw, 100vw"
          src={bannerUrl}
        />
      ) : <CatalogHeroFallback />}
    </div>
  );
}
