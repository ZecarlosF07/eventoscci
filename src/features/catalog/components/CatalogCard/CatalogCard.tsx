import Link from "next/link";

import { Heading } from "@/components/atoms/Heading";
import { BannerImage } from "@/components/molecules/BannerImage";
import type { CatalogCardProps } from "@/features/catalog/components/CatalogCard/types/catalog-card.types";

export function CatalogCard({ action, bannerUrl, children, featured = false, href, id, labels, metadata, price, title }: CatalogCardProps) {
  const titleId = `${id}-title`;
  const actionId = `${id}-action`;
  const imageSizes = featured
    ? "(min-width: 1280px) 736px, (min-width: 1024px) 60vw, 100vw"
    : "(min-width: 1280px) 400px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw";

  return (
    <Link aria-labelledby={`${titleId} ${actionId}`} className="group block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cci-800" href={href}>
      <article className={`${featured ? "grid lg:grid-cols-[3fr_2fr]" : "flex flex-col"} h-full overflow-hidden rounded-2xl border border-cci-100 bg-white shadow-sm transition duration-200 group-hover:border-cci-300 group-hover:shadow-lg motion-reduce:transition-none`}>
        <div className={`relative aspect-[5/2] overflow-hidden bg-cci-950 ${featured ? "lg:aspect-auto lg:min-h-60" : ""}`}>
          {bannerUrl ? <BannerImage alt={`Banner de ${title}`} className="transition duration-200 group-hover:brightness-110 motion-reduce:transition-none" sizes={imageSizes} src={bannerUrl} /> : (
            <div className="relative flex h-full items-center justify-center overflow-hidden text-4xl font-bold tracking-tighter text-white/85">
              <span aria-hidden="true" className="absolute -right-10 -top-16 size-52 rounded-full border border-cci-lime/50" />
              <span aria-hidden="true" className="absolute -right-4 -top-10 size-40 rounded-full border border-cci-lime/25" />
              <span>CCI</span>
            </div>
          )}
        </div>
        <div className={`flex min-w-0 flex-1 flex-col gap-3 p-5 ${featured ? "lg:p-6" : ""}`}>
          <div className="flex flex-wrap gap-2">{labels}</div>
          <Heading className="line-clamp-3 leading-snug" id={titleId} level={3}>{title}</Heading>
          {metadata}
          {children}
          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-cci-100 pt-3">
            <div className="min-w-0">{price}</div>
            <span className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-cci-950 px-4 py-2 text-sm font-bold text-white transition group-hover:bg-cci-800 motion-reduce:transition-none" id={actionId}>{action} <span aria-hidden="true">→</span></span>
          </div>
        </div>
      </article>
    </Link>
  );
}
