import Link from "next/link";

import { BannerFrame, BannerImage } from "@/components/molecules/BannerImage";
import { MotionSurface } from "@/components/molecules/MotionSurface/MotionSurface";
import type { VisualContentCardProps } from "@/components/molecules/VisualContentCard/types/visual-content-card.types";

export function VisualContentCard({ animationOrder = 0, bannerUrl, href, meta, summary, title }: VisualContentCardProps) {
  return (
    <MotionSurface animationOrder={animationOrder} className="group h-full" mode="card">
      <Link className="flex h-full flex-col overflow-hidden rounded-2xl border border-cci-100 bg-white shadow-sm transition duration-200 hover:border-cci-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cci-800 motion-reduce:transition-none" href={href}>
        <BannerFrame className="bg-cci-950">
          {bannerUrl ? (
            <BannerImage alt={`Banner de ${title}`} className="transition duration-200 group-hover:brightness-90 motion-reduce:transition-none" sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" src={bannerUrl} />
          ) : (
            <div aria-hidden="true" className="absolute inset-0 grid place-items-center bg-linear-to-br from-cci-600 to-cci-800 text-4xl font-bold tracking-tighter text-cci-lime">CCI</div>
          )}
        </BannerFrame>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="line-clamp-3 text-lg font-semibold leading-snug text-cci-950">{title}</h3>
          {!bannerUrl && summary ? <p className="line-clamp-2 text-sm leading-6 text-cci-600">{summary}</p> : null}
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-cci-100 pt-3">
            {meta ? <p className="min-w-0 text-sm font-medium text-cci-600">{meta}</p> : <span />}
            <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-xl bg-cci-950 text-cci-lime transition group-hover:bg-cci-800 motion-reduce:transition-none">→</span>
          </div>
        </div>
      </Link>
    </MotionSurface>
  );
}
