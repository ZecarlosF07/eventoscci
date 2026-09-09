import Image from "next/image";

import type { HomeHeroArtworkProps } from "@/features/home/components/HomeHero/types/home-hero.types";

export function HomeHeroArtwork({
  bannerUrl,
  description,
  eager = false,
  title,
  variant,
  wide = false,
}: HomeHeroArtworkProps) {
  return (
    <div className={wide
      ? "relative isolate aspect-[5/2] w-full overflow-hidden bg-cci-900 text-white"
      : "relative isolate aspect-video min-w-0 overflow-hidden bg-cci-900 text-white lg:h-full lg:aspect-auto"}
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
      ) : variant === "commercial" ? (
        <div className="absolute inset-0 overflow-hidden bg-linear-to-br from-cci-950 via-cci-800 to-[#315f49] text-white">
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(188,241,108,0.32),transparent_30%)]" />
          <span className="absolute -right-10 -top-28 size-72 rounded-full border border-cci-lime/35 sm:-right-12 sm:-top-40 sm:size-[30rem]" />
          <span className="absolute right-8 top-3 size-32 rounded-full border border-white/15 sm:right-20 sm:top-10 sm:size-72" />
          <span className="absolute -bottom-24 right-1/4 size-56 rounded-full bg-cci-lime/15 blur-3xl sm:size-80" />

          <div className="relative flex h-full items-center px-5 py-3 sm:px-10 sm:py-7 lg:px-16">
            <div className="max-w-[78%] sm:max-w-2xl">
              <Image
                alt=""
                className="h-auto w-24 sm:w-36 lg:w-44"
                height={58}
                src="/assets/brand/cci-logo-white.webp"
                width={180}
              />
              <p className="mt-2 text-xl font-semibold leading-none tracking-tight text-balance sm:mt-4 sm:text-4xl lg:text-5xl">
                Conecta. Aprende. Crece.
              </p>
              {description ? (
                <p className="mt-3 hidden max-w-xl text-sm leading-6 text-cci-100 sm:line-clamp-2 lg:text-base">
                  {description}
                </p>
              ) : null}
              <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-cci-lime/45 bg-cci-lime px-3 py-1.5 text-[0.625rem] font-bold text-cci-950 shadow-lg shadow-black/10 sm:mt-5 sm:px-4 sm:py-2 sm:text-xs">
                Explorar {title}
                <span aria-hidden="true">→</span>
              </span>
            </div>

            <div aria-hidden="true" className="absolute bottom-[16%] right-[7%] hidden items-end gap-3 md:flex">
              <span className="h-16 w-8 rounded-t-xl bg-white/15 lg:h-24 lg:w-11" />
              <span className="h-24 w-8 rounded-t-xl bg-cci-lime/45 lg:h-36 lg:w-11" />
              <span className="h-36 w-8 rounded-t-xl bg-cci-lime lg:h-52 lg:w-11" />
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex overflow-hidden bg-linear-to-br from-cci-800 to-cci-950 px-6 py-5 sm:px-10 sm:py-7 lg:px-14">
          <span className="absolute -right-24 -top-36 size-96 rounded-full border border-cci-lime/25" />
          <span className="absolute -right-10 -top-20 size-72 rounded-full border border-cci-lime/15" />
          <span className="absolute -bottom-24 left-10 size-56 rounded-full bg-cci-lime/10 blur-3xl" />
          <div className="relative my-auto max-w-3xl">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-cci-lime sm:text-xs">Cámara de Comercio de Ica</p>
            <p className="mt-2 line-clamp-2 text-xl font-semibold leading-tight text-balance text-white sm:text-3xl lg:text-4xl">{title}</p>
          </div>
          <span aria-hidden="true" className="absolute bottom-3 right-5 text-5xl font-black tracking-tighter text-white/5 sm:text-7xl lg:text-8xl">CCI</span>
        </div>
      )}
    </div>
  );
}
