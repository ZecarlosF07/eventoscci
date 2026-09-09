import type { CatalogHeroHeaderProps } from "@/features/catalog/components/CatalogHeroCarousel/types/catalog-hero-header.types";

export function CatalogHeroHeader({
  description,
  eyebrow,
  title,
}: CatalogHeroHeaderProps) {
  return (
    <header className="border-y border-cci-100 bg-white">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center gap-5 px-5 py-3 sm:px-8 lg:gap-7">
        <span aria-hidden="true" className="h-10 w-1 shrink-0 rounded-full bg-cci-lime" />
        <div className="shrink-0">
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.2em] text-cci-700 sm:text-[0.6875rem]">
            {eyebrow}
          </p>
          <h1 className="mt-0.5 text-xl font-semibold leading-tight tracking-tight text-balance text-cci-950 sm:text-2xl">
            {title}
          </h1>
        </div>
        <span aria-hidden="true" className="hidden h-9 w-px shrink-0 bg-cci-200 md:block" />
        <p className="hidden max-w-2xl text-sm leading-5 text-cci-600 md:line-clamp-2">
          {description}
        </p>
      </div>
    </header>
  );
}
