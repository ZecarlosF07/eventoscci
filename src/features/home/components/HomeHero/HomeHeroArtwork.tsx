import Image from "next/image";

import type { HomeHeroArtworkProps } from "@/features/home/components/HomeHero/types/home-hero.types";

export function HomeHeroArtwork({ bannerUrl, eager = false, title, wide = false }: HomeHeroArtworkProps) {
  return (
    <div className={wide
      ? "relative isolate aspect-[5/2] w-full overflow-hidden bg-cci-900 text-white"
      : "relative isolate aspect-video min-w-0 overflow-hidden bg-cci-900 text-white lg:aspect-auto lg:min-h-96"}
    >
      {bannerUrl ? (
        <Image
          alt={`Banner de ${title}`}
          className="object-contain"
          fill
          preload={eager}
          sizes={wide ? "100vw" : "(min-width: 1024px) 53vw, 100vw"}
          src={bannerUrl}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-linear-to-br from-cci-900 to-cci-950">
          <span className="absolute -right-24 -top-36 size-96 rounded-full border border-cci-lime/25" />
          <span className="absolute -right-10 -top-20 size-72 rounded-full border border-cci-lime/15" />
          <span className="absolute -bottom-24 left-10 size-56 rounded-full bg-cci-lime/10 blur-3xl" />
          <div className="absolute inset-6 rounded-[1.5rem] border border-white/10 sm:inset-8" />
        </div>
      )}
    </div>
  );
}
