import { BannerFrame, BannerImage } from "@/components/molecules/BannerImage";
import { CatalogHeroFallback } from "@/features/catalog/components/CatalogHeroCarousel/CatalogHeroFallback";
import type { CatalogHeroVisualProps } from "@/features/catalog/components/CatalogHeroCarousel/types/catalog-hero-visual.types";

export function CatalogHeroVisual({ bannerUrl, eager = false, title, wide = false }: CatalogHeroVisualProps) {
  return (
    <BannerFrame className="rounded-2xl border border-white/20 bg-cci-950 shadow-2xl shadow-black/20 sm:rounded-3xl">
      {bannerUrl ? (
        <BannerImage
          alt={`Banner de ${title}`}
          backdropIntensity="prominent"
          preload={eager}
          sizes={wide ? "(min-width: 1280px) 1216px, 100vw" : "(min-width: 1280px) 580px, (min-width: 1024px) 46vw, (min-width: 640px) 80vw, 100vw"}
          src={bannerUrl}
        />
      ) : <CatalogHeroFallback />}
    </BannerFrame>
  );
}
