import { BannerImage } from "@/components/molecules/BannerImage";
import type { ActivityDetailMediaProps } from "@/features/activities/components/ActivityDetailMedia/types/activity-detail-media.types";
import { getActivityBannerUrl } from "@/features/activities/utils/activity-formatters";

export function ActivityDetailMedia({ activity }: ActivityDetailMediaProps) {
  const bannerUrl = getActivityBannerUrl(activity.banner_path);

  return (
    <div className="relative aspect-[5/2] min-w-0 overflow-hidden rounded-2xl border border-cci-100 bg-cci-950 shadow-lg shadow-cci-950/10 sm:rounded-3xl">
      {bannerUrl ? (
        <BannerImage
          alt={`Banner de ${activity.title}`}
          preload
          sizes="(min-width: 1280px) 960px, (min-width: 768px) 90vw, 100vw"
          src={bannerUrl}
        />
      ) : (
        <div className="absolute inset-0 flex items-end overflow-hidden bg-cci-950 p-6 text-white sm:p-10">
          <span aria-hidden="true" className="absolute -right-24 -top-40 size-[30rem] rounded-full border border-cci-lime/50" />
          <span aria-hidden="true" className="absolute -right-12 -top-28 size-96 rounded-full border border-cci-lime/30" />
          <span aria-hidden="true" className="absolute -right-2 -top-16 size-72 rounded-full border border-cci-lime/20" />
          <p className="relative text-2xl font-semibold leading-tight sm:text-4xl">Cámara de Comercio de Ica</p>
        </div>
      )}
    </div>
  );
}
